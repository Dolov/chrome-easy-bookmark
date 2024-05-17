
import React from "react"
import { Modal, Button, Dropdown, message, TreeSelect, type GetRef } from 'antd'
import { type MenuProps } from 'antd'
import { InfoCircleFilled } from '@ant-design/icons'
import {
  MessageActionEnum, copyTextToClipboard,
  baseZIndex, formatBookmarkTreeNodes, getBookmarksToText,
  downloadBookmarkAsHtml,
} from '~/utils'
import TextInput from './TextInput'
import {
  MdiRename,
  MingcuteSearch2Fill,
  RiDownloadCloud2Fill,
  MaterialSymbolsDelete,
  FluentFolderAdd24Filled,
  MaterialSymbolsBookmarkRemove,
  MaterialSymbolsContentCopyRounded,
  MaterialSymbolsDriveFileMoveRounded,
} from './Icon'
import { DeleteConfirmModal } from '~components/HandlerBar'


type TreeSelectRef = GetRef<typeof TreeSelect>

const TreeNodeTitleContainer = props => {
  const {
    node, onSuccess, editingBookmark, setEditingBookmark,
    children: jsxTitleChildren, setNodeExpand, addKeyword, dataSource,
  } = props
  const { url, id, children, originalTitle } = node
  const [visible, setVisible] = React.useState(false)
  const [parentId, setParentId] = React.useState(id)
  const [moveTreeOpen, setMoveTreeOpen] = React.useState(false)
  const [moveModalOpen, setMoveModalOpen] = React.useState(false)
  const moveTreeSelectRef = React.useRef<TreeSelectRef>()

  const DeleteIcon = url ? MaterialSymbolsBookmarkRemove: MaterialSymbolsDelete
  /** 两个根节点 */
  const rootNode = ["1", "2"].includes(id)

  const nodes = React.useMemo(() => {
    if (!moveModalOpen) return []
    return formatBookmarkTreeNodes(dataSource, false, {
      excludeChildrenNodeId: id,
    })
  }, [dataSource, moveModalOpen])

  const deleteNode = (folder = false) => {
    const action = folder ? MessageActionEnum.BOOKMARK_REMOVE_TREE : MessageActionEnum.BOOKMARK_REMOVE
    chrome.runtime.sendMessage({
      action,
      id: node.id
    }).then(res => {
      onSuccess()
    })
  }

  const handleDelete = e => {
    e.stopPropagation()
    if (url) {
      deleteNode()
      return
    }
    if (
      !children.length ||
      children.length === 1
    ) {
      deleteNode(true)
      return
    }
    setVisible(true)
  }

  const menuItems: MenuProps['items'] = React.useMemo(() => {
    const renameItem = {
      label: (
        <div className="h-center">
          <MdiRename className="mr-2 text-lg text-gray-700" />
          重命名
        </div>
      ),
      key: 'rename',
    }
    const addFolderItem = {
      label: (
        <div className="h-center">
          <FluentFolderAdd24Filled className="mr-2 text-lg text-gray-700" />
          添加文件夹
        </div>
      ),
      key: 'add-folder',
    }
    const searchItem = {
      label: (
        <div className="h-center">
          <MingcuteSearch2Fill className="mr-2 text-lg text-gray-700 min-w-[18px]" />
          <div className="max-w-[200px] ellipsis">{`搜索 "${originalTitle}"`}</div>
        </div>
      ),
      key: 'add-keyword',
    }
    const moveItem = {
      label: (
        <div className="h-center">
          <MaterialSymbolsDriveFileMoveRounded className="mr-2 text-lg text-gray-700" />
          移动
        </div>
      ),
      key: 'move',
    }
    const copyItem = {
      label: (
        <div className="h-center">
          <MaterialSymbolsContentCopyRounded className="mr-2 text-lg text-gray-700" />
          复制
        </div>
      ),
      key: 'copy',
    }
    const downloadItem = {
      label: (
        <div className="h-center">
          <RiDownloadCloud2Fill className="mr-2 text-lg text-gray-700" />
          下载
        </div>
      ),
      key: 'download',
    }
    const deleteItem = {
      label: (
        <div className="text-red-500 font-medium h-center">
          <DeleteIcon className="mr-2 text-lg" />
          删除
        </div>
      ),
      key: 'delete',
    }

    if (rootNode) {
      return [
        copyItem,
        downloadItem,
        addFolderItem,
      ]
    }

    if (url) {
      return [
        renameItem,
        searchItem,
        copyItem,
        moveItem,
        deleteItem,
      ]
    }

    return [
      renameItem,
      searchItem,
      addFolderItem,
      copyItem,
      moveItem,
      downloadItem,
      deleteItem,
    ]
  }, [])

  const handleContextMenu = async e => {
    e.domEvent.stopPropagation()
    const { key } = e
    if (key === "rename") {
      setEditingBookmark(node)
      return
    }
    if (key === "add-folder") {
      const newFolder = await chrome.runtime.sendMessage({
        action: MessageActionEnum.BOOKMARK_CREATE,
        payload: {
          title: "新建文件夹",
          parentId: id,
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
      setTimeout(() => {
        setMoveTreeOpen(true)
        moveTreeSelectRef.current.focus()
      }, 400);
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
        parentId,
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
    <Dropdown menu={{ items: menuItems, onClick: handleContextMenu }} trigger={['contextMenu']}>
      <div className="flex group">
        <TextInput
          url={url}
          type={type}
          value={originalTitle}
          editing={editing}
          onSave={onSave}
        >
          {jsxTitleChildren}
        </TextInput>
        {!rootNode && (
          <div className="flex-1 justify-end flex items-center">
            <Button
              type="text"
              shape="circle"
              onClick={handleDelete}
              className="w-6 h-6 !min-w-6 flex justify-center items-center invisible group-hover:visible"
            >
              <DeleteIcon className="text-lg hover:text-red-600" />
            </Button>
          </div>
        )}
        <div onClick={e => e.stopPropagation()}>
          <DeleteConfirmModal
            visible={visible}
            onOk={() => deleteNode(true)}
            onCancel={() => setVisible(false)}
            dataSource={[node]}
          />
          <Modal
            centered
            open={moveModalOpen}
            title={`移动 ${originalTitle}`}
            zIndex={baseZIndex}
            okText="确定"
            cancelText="取消"
            onCancel={() => setMoveModalOpen(false)}
            onOk={handleMove}
          >
            <TreeSelect
              showSearch
              ref={moveTreeSelectRef}
              open={moveTreeOpen}
              onDropdownVisibleChange={setMoveTreeOpen}
              style={{ width: "100%" }}
              treeData={nodes}
              value={parentId}
              onChange={setParentId}
              treeNodeFilterProp="originalTitle"
              treeDefaultExpandedKeys={["1", "2"]}
            />
          </Modal>
        </div>
      </div>
    </Dropdown>
  )
}

export default TreeNodeTitleContainer