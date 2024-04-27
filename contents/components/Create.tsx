import React from "react"
import { Button, Modal, Form, Input, TreeSelect } from 'antd'
import { MessageActionEnum, formatBookmarkTreeNodes, findTreeNode } from '~/utils'


const DEFAULT_PARENT_ID = "1"

interface CreateProps {
  visible: boolean
  toggleVisible: () => void
  toggleListVisible: () => void
}

const Create: React.FC<CreateProps> = props => {
  const { visible, toggleVisible, toggleListVisible } = props
  const [form] = Form.useForm();
  const [disabled, setDisabled] = React.useState(false)
  const [treeNodes, setTreeNodes] = React.useState([])
  const [treeNodeDirs, setTreeNodeDirs] = React.useState([])
  const [bookmark, setBookmark] = React.useState<chrome.bookmarks.BookmarkTreeNode>()

  React.useEffect(() => {
    if (!visible) return
    init()
  }, [visible])

  const init = () => {
    chrome.runtime.sendMessage({
      action: MessageActionEnum.BOOKMARK_GET_TREE
    }, treeNodes => {
      const formattedTreeNodes = formatBookmarkTreeNodes(treeNodes)
      const url = location.href
      const node = findTreeNode(url, treeNodes)
      setBookmark(node)
      setTreeNodes(treeNodes)
      setTreeNodeDirs(formattedTreeNodes[0].children)
    });
  }

  const save = () => {
    const { parentId = DEFAULT_PARENT_ID, title } = form.getFieldsValue()
    const payload: Partial<chrome.bookmarks.BookmarkTreeNode> = {
      title,
      url: location.href,
    }
    let action = MessageActionEnum.BOOKMARK_CREATE
    if (bookmark) {
      payload.id = bookmark.id
      action = MessageActionEnum.BOOKMARK_UPDATE
      if (bookmark.parentId !== parentId) {
        action = MessageActionEnum.BOOKMARK_MOVE
        payload.parentId = parentId
      }
    } else {
      payload.parentId = parentId
    }

    chrome.runtime.sendMessage({
      action,
      payload,
    }, res => {
      init()
      toggleVisible()
    });
  }

  const onValueChange = (changedValue, values) => {
    const disabled = !values.title || !values.parentId
    setDisabled(disabled)
  }

  const handleDelete = () => {
    chrome.runtime.sendMessage({
      id: bookmark.id,
      action: MessageActionEnum.BOOKMARK_DELETE,
    }, res => {
      init()
      toggleVisible()
    });
  }

  const create = !bookmark
  const modalType = create ? "新建书签" : "编辑书签"

  const { title = document.title, parentId = DEFAULT_PARENT_ID } = bookmark || {}

  return (
    <Modal
      open={visible}
      title={(
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{ fontSize: 32, cursor: 'pointer', marginRight: 16 }}
            onClick={() => {
              toggleListVisible()
              toggleVisible()
            }}
          >
            🔖
          </div>
          <span>{modalType}</span>
        </div>
      )}
      onOk={save}
      onCancel={toggleVisible}
      className="create-modal"
      footer={<ModalFooter handleDelete={handleDelete} save={save} toggle={toggleVisible} disabled={disabled} create={create} />}
    >
      <Form
        form={form}
        colon={false}
        style={{ margin: "24px 0" }}
        labelCol={{ span: 4 }}
        labelAlign="left"
        initialValues={{ title, parentId }}
        onValuesChange={onValueChange}
      >
        <Form.Item name="title" label="名称">
          <Input />
        </Form.Item>
        <Form.Item name="parentId" label="文件夹">
          <TreeSelect
            ref={ref => {
              ref?.focus?.()
            }}
            showSearch
            treeData={treeNodeDirs}
            treeNodeFilterProp="title"
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

const ModalFooter = props => {
  const { handleDelete, save, toggle, disabled, create } = props
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      {!create && (
        <Button
          danger
          shape="round"
          style={{ marginLeft: 0 }}
          onClick={handleDelete}
        >
          移除
        </Button>
      )}
      <div style={{ flex: 1 }}>
        <Button onClick={toggle} shape="round">取消</Button>
        <Button
          type='primary'
          shape="round"
          disabled={disabled}
          onClick={save}
          style={{ marginLeft: 8 }}
        >
          保存
        </Button>
      </div>
    </div>
  )
}

export default Create