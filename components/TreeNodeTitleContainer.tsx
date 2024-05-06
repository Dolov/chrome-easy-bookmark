
import React from "react"
import { Modal, Button, Dropdown } from 'antd'
import { type MenuProps } from 'antd'
import {
  DeleteOutlined, InfoCircleFilled, DeleteFilled, FolderAddFilled, EditFilled
} from '@ant-design/icons'
import { MessageActionEnum } from '~/utils'
import TextInput from './TextInput'

const TreeNodeTitleContainer = props => {
  const { node, onSuccess, editingBookmark, setEditingBookmark, children: jsxTitleChildren } = props
  const { url, id, children, originalTitle } = node
  const [visible, setVisible] = React.useState(false)

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
      label: <div><EditFilled className="mr-2" />重命名</div>,
      key: 'rename',
    }
    const addFolderItem = {
      label: <div><FolderAddFilled className="mr-2" />添加文件夹</div>,
      key: 'add-folder',
    }
    const deleteItem = {
      label: <div className="text-red-500 font-medium"><DeleteFilled className="mr-2" />删除</div>,
      key: 'delete',
    }

    if (url) {
      return [renameItem, deleteItem]
    }

    if (rootNode) {
      return [
        addFolderItem,
      ]
    }

    return [
      renameItem,
      addFolderItem,
      deleteItem,
    ]
  }, [])

  const handleContextMenu = async e => {
    e.domEvent.stopPropagation()
    const { key } = e
    if (key === "rename") {
      setEditingBookmark(node)
    }
    if (key === "add-folder") {
      const newFolder = await chrome.runtime.sendMessage({
        action: MessageActionEnum.BOOKMARK_CREATE,
        payload: {
          title: "新建文件夹",
          parentId: id,
        }
      })
      setEditingBookmark(newFolder)
      onSuccess()
    }
    if (key === "delete") {
      handleDelete(e.domEvent)
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

  const { id: editId } = editingBookmark || {}
  const editing = editId === id

  return (
    <Dropdown menu={{ items: menuItems, onClick: handleContextMenu }} trigger={['contextMenu']}>
      <div className="flex group">
        <TextInput value={originalTitle} editing={editing} onSave={onSave}>
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
              <DeleteOutlined />
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