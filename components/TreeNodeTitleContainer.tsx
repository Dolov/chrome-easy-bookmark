
import React from "react"
import { Modal, Button, Dropdown, message } from 'antd'
import { type MenuProps } from 'antd'
import { InfoCircleFilled } from '@ant-design/icons'
import { MessageActionEnum, copyTextToClipboard } from '~/utils'
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

const TreeNodeTitleContainer = props => {
  const {
    node, onSuccess, editingBookmark, setEditingBookmark,
    children: jsxTitleChildren, setNodeExpand, addKeyword
  } = props
  const { url, id, children, originalTitle } = node
  const [visible, setVisible] = React.useState(false)
  const DeleteIcon = url ? MaterialSymbolsBookmarkRemove: MaterialSymbolsDelete

  /** 两个根节点 */
  const rootNode = ["1", "2"].includes(id)

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
        <div className="max-w-[200px] ellipsis h-center">
          <MingcuteSearch2Fill className="mr-2 text-lg text-gray-700" />
          {`搜索 "${originalTitle}"`}
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
        return
      }
    }
    if (key === "move") {
      return
    }
    if (key === "download") {
      return
    }
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
          <Modal
            centered
            open={visible}
            onOk={e => deleteNode(true)}
            okText="确定"
            cancelText="取消"
            title={(
              <p className="flex items-center">
                <InfoCircleFilled className="text-yellow-500 mr-2 text-xl" />
                <span>确定删除该目录？</span>
              </p>
            )}
            onCancel={e => setVisible(false)}
          >
            <div>
              该目录下存在 {children.length} 个书签和子目录，删除后无法恢复，请谨慎操作。
            </div>
          </Modal>
        </div>
      </div>
    </Dropdown>
  )
}

export default TreeNodeTitleContainer