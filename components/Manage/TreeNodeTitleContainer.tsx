import {
  Button,
  Dropdown,
  message,
  Modal,
  TreeSelect,
  type GetRef,
  type MenuProps
} from "antd"
import React from "react"

import {
  baseZIndex,
  copyTextToClipboard,
  downloadBookmarkAsHtml,
  formatBookmarkTreeNodes,
  getBookmarksToText,
  MessageActionEnum,
  type TreeNodeProps
} from "~/utils"
import {
  DeleteConfirmModal,
  MoveParentFolderModal
} from "~components/Manage/HandlerBar"

import {
  FluentFolderAdd24Filled,
  MaterialSymbolsBookmarkRemove,
  MaterialSymbolsContentCopyRounded,
  MaterialSymbolsDelete,
  MaterialSymbolsDriveFileMoveRounded,
  MaterialSymbolsShareReviews,
  MdiRename,
  MingcuteSearch2Fill,
  RiDownloadCloud2Fill
} from "../Icon"
import ShareModal from "./Share"
import TextInput from "./TextInput"

/**
 * Recursively retrieves the IDs of the node and its children.
 *
 * @param {TreeNodeProps} node - The node to start retrieving IDs from.
 * @return {Array<number>} An array of IDs including the node and its children.
 */
const getIds = (node: TreeNodeProps) => {
  const { id, children = [] } = node
  return children.reduce(
    (currentValue, item: TreeNodeProps) => {
      currentValue.push(...getIds(item))
      return currentValue
    },
    [id]
  )
}

type TreeSelectRef = GetRef<typeof TreeSelect>

const TreeNodeTitleContainer = (props) => {
  const {
    node,
    onSuccess,
    editingBookmark,
    setEditingBookmark,
    children: jsxTitleChildren,
    setNodeExpand,
    addKeyword,
    dataSource,
    setCheckedKeys,
    checkedKeysRef
  } = props
  const { url, id, children, originalTitle } = node
  const [visible, setVisible] = React.useState(false)
  const [shareModalOpen, setShareModalOpen] = React.useState(false)
  const [parentId, setParentId] = React.useState(id)
  const [moveModalOpen, setMoveModalOpen] = React.useState(false)
  const moveTreeSelectRef = React.useRef<TreeSelectRef>()

  const DeleteIcon = url ? MaterialSymbolsBookmarkRemove : MaterialSymbolsDelete
  /** 两个根节点 */
  const rootNode = ["1", "2"].includes(id)

  const deleteNode = (folder = false) => {
    const action = folder
      ? MessageActionEnum.BOOKMARK_REMOVE_TREE
      : MessageActionEnum.BOOKMARK_REMOVE
    chrome.runtime
      .sendMessage({
        id,
        action
      })
      .then((res) => {
        const ids = getIds(node)
        const nextCheckedKeys = checkedKeysRef.current.filter(
          (key) => !ids.includes(key)
        )
        setCheckedKeys(nextCheckedKeys)
        onSuccess()
      })
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    if (url) {
      deleteNode()
      return
    }
    if (!children.length || children.length === 1) {
      deleteNode(true)
      return
    }
    setVisible(true)
  }

  const menuItems: MenuProps["items"] = React.useMemo(() => {
    const renameItem = {
      label: (
        <div className="h-center">
          <MdiRename className="mr-2 text-lg text-gray-700" />
          重命名
        </div>
      ),
      key: "rename"
    }
    const shareItem = {
      label: (
        <div className="h-center">
          <MaterialSymbolsShareReviews className="mr-2 text-lg text-gray-700" />
          分享
        </div>
      ),
      key: "share"
    }
    const addFolderItem = {
      label: (
        <div className="h-center">
          <FluentFolderAdd24Filled className="mr-2 text-lg text-gray-700" />
          添加文件夹
        </div>
      ),
      key: "add-folder"
    }
    const searchItem = {
      label: (
        <div className="h-center">
          <MingcuteSearch2Fill className="mr-2 text-lg text-gray-700 min-w-[18px]" />
          <div className="max-w-[200px] ellipsis">{`搜索 "${originalTitle}"`}</div>
        </div>
      ),
      key: "add-keyword"
    }
    const moveItem = {
      label: (
        <div className="h-center">
          <MaterialSymbolsDriveFileMoveRounded className="mr-2 text-lg text-gray-700" />
          移动
        </div>
      ),
      key: "move"
    }
    const copyItem = {
      label: (
        <div className="h-center">
          <MaterialSymbolsContentCopyRounded className="mr-2 text-lg text-gray-700" />
          复制
        </div>
      ),
      key: "copy"
    }
    const downloadItem = {
      label: (
        <div className="h-center">
          <RiDownloadCloud2Fill className="mr-2 text-lg text-gray-700" />
          下载
        </div>
      ),
      key: "download"
    }
    const deleteItem = {
      label: (
        <div className="text-red-500 font-medium h-center">
          <DeleteIcon className="mr-2 text-lg" />
          删除
        </div>
      ),
      key: "delete"
    }

    // 两个根节点
    if (rootNode) {
      return [copyItem, downloadItem, addFolderItem]
    }

    // 书签
    if (url) {
      return [renameItem, searchItem, shareItem, copyItem, moveItem, deleteItem]
    }

    // 文件夹
    return [
      renameItem,
      searchItem,
      addFolderItem,
      copyItem,
      moveItem,
      downloadItem,
      deleteItem
    ]
  }, [])

  const handleContextMenu = async (e) => {
    e.domEvent.stopPropagation()
    const { key } = e
    if (key === "rename") {
      setEditingBookmark(node)
      return
    }
    if (key === "share") {
      setShareModalOpen(true)
      return
    }
    if (key === "add-folder") {
      const newFolder = await chrome.runtime.sendMessage({
        action: MessageActionEnum.BOOKMARK_CREATE,
        payload: {
          title: "新建文件夹",
          parentId: id
        }
      })
      onSuccess()
      setNodeExpand(node.id)
      setEditingBookmark({
        ...newFolder,
        type: "add-folder"
      })
      return
    }
    if (key === "delete") {
      handleDelete(e.domEvent)
      return
    }
    if (key === "add-keyword") {
      addKeyword(originalTitle)
      return
    }
    if (key === "copy") {
      if (url) {
        copyTextToClipboard(url)
      } else {
        const text = getBookmarksToText(children)
        copyTextToClipboard(text)
      }
      message.success("复制成功。")
      return
    }
    if (key === "move") {
      const viewId = url ? undefined : id
      setParentId(viewId)
      setMoveModalOpen(true)
      return
    }
    if (key === "download") {
      downloadBookmarkAsHtml(children, originalTitle)
      return
    }
  }

  const handleMove = async () => {
    setMoveModalOpen(false)
    if (!parentId) return
    if (parentId === id) return
    const res = await chrome.runtime.sendMessage({
      action: MessageActionEnum.BOOKMARK_MOVE,
      payload: {
        id,
        index: 0,
        parentId
      }
    })
    onSuccess()
  }

  const onSave = async (value: string) => {
    if (!value) return
    setEditingBookmark(undefined)
    const res = await chrome.runtime.sendMessage({
      action: MessageActionEnum.BOOKMARK_UPDATE,
      payload: {
        id: editingBookmark.id,
        title: value
      }
    })
    onSuccess()
  }

  const { id: editId, type } = editingBookmark || {}
  const editing = editId === id

  return (
    <Dropdown
      menu={{ items: menuItems, onClick: handleContextMenu }}
      trigger={["contextMenu"]}>
      <div className="flex group">
        <TextInput
          url={url}
          type={type}
          value={originalTitle}
          editing={editing}
          onSave={onSave}>
          {jsxTitleChildren}
        </TextInput>
        {!rootNode && (
          <div className="flex-1 justify-end flex items-center">
            <Button
              type="text"
              shape="circle"
              onClick={handleDelete}
              className="w-6 h-6 !min-w-6 flex justify-center items-center invisible group-hover:visible">
              <DeleteIcon className="text-lg hover:text-red-600" />
            </Button>
          </div>
        )}
        <div onClick={(e) => e.stopPropagation()}>
          <ShareModal
            data={node}
            visible={shareModalOpen}
            onCancel={() => setShareModalOpen(false)}
          />
          <DeleteConfirmModal
            visible={visible}
            onOk={() => deleteNode(true)}
            onCancel={() => setVisible(false)}
            dataSource={[node]}
          />
          <MoveParentFolderModal
            dataSource={dataSource}
            visible={moveModalOpen}
            onOk={handleMove}
            onCancel={() => setMoveModalOpen(false)}
            value={parentId}
            onChange={setParentId}
            excludeChildrenNodeId={id}
          />
        </div>
      </div>
    </Dropdown>
  )
}

export default TreeNodeTitleContainer
