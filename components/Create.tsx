import React from "react"
import { Button, Modal, Form, Input, TreeSelect } from 'antd'
import { MessageActionEnum, formatBookmarkTreeNodes, findTreeNode, baseZIndex } from '~/utils'

const DEFAULT_PARENT_ID = "1"

const prefixCls = "create-container"

const setTreeNodeTitle = (nodes = [], options) => {
  const { init } = options
  return nodes.map(node => {
    const { title, children } = node
    return {
      ...node,
      isLeaf: !children.length,
      title: (
        <div className="flex">
          <span>{title}</span>
          <div className="actions">
            
          </div>
        </div>
      ),
      children: setTreeNodeTitle(children, options)
    }
  })
}

interface CreateProps {
  visible: boolean
  url?: string
  title?: string
  toggleVisible?: () => void
  toggleListVisible?: () => void
}

const Create: React.FC<CreateProps> = props => {
  const {
    url = location.href, title = document.title,
    visible, toggleVisible, toggleListVisible = () => {},
  } = props
  const [form] = Form.useForm()
  const [disabled, setDisabled] = React.useState(false)
  const [treeNodes, setTreeNodes] = React.useState([])
  const [treeNodeDirs, setTreeNodeDirs] = React.useState([])
  const [editBookmark, setEditBookmark] = React.useState<chrome.bookmarks.BookmarkTreeNode>()

  const closable = !!toggleVisible

  React.useEffect(() => {
    if (!visible) return
    init().then(treeNodes => {
      setFormInitialValues(treeNodes)
    })
  }, [visible])

  const init = async () => {
    return new Promise(resolve => {
      chrome.runtime.sendMessage({
        action: MessageActionEnum.BOOKMARK_GET_TREE
      }, treeNodes => {
        const formattedTreeNodes = formatBookmarkTreeNodes(treeNodes)
        setTreeNodes(treeNodes)
        const nodes = formattedTreeNodes[0].children
        const jsxTitleNodes = setTreeNodeTitle(nodes, {
          init,
        })
        setTreeNodeDirs(jsxTitleNodes)
        resolve(treeNodes)
      });
    })
  }

  const save = () => {
    const { parentId = DEFAULT_PARENT_ID, title } = form.getFieldsValue()
    const payload: Partial<chrome.bookmarks.BookmarkTreeNode> = {
      url,
      title,
    }
    let action = MessageActionEnum.BOOKMARK_CREATE
    if (editBookmark) {
      payload.id = editBookmark.id
      action = MessageActionEnum.BOOKMARK_UPDATE
      if (editBookmark.parentId !== parentId) {
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
      closable && toggleVisible()
    });
  }

  const onValueChange = (changedValue, values) => {
    const disabled = !values.title || !values.parentId
    setDisabled(disabled)
  }

  const handleDelete = () => {
    chrome.runtime.sendMessage({
      id: editBookmark.id,
      action: MessageActionEnum.BOOKMARK_REMOVE,
    }, res => {
      init()
      closable && toggleVisible()
      setEditBookmark(undefined)
    });
  }

  const setFormInitialValues = treeNodes => {
    if (!form) return
    const node = findTreeNode(url, treeNodes)
    if (node) {
      const { title, parentId } = node
      setEditBookmark(node)
      form.setFieldsValue({
        title,
        parentId,
      })
      return
    }
    form.setFieldsValue({
      title,
      parentId: DEFAULT_PARENT_ID,
    })
  }

  const create = !editBookmark
  const modalType = create ? "新建书签" : "编辑书签"

  return (
    <Modal
      zIndex={baseZIndex}
      open={visible}
      title={(
        <div className="flex items-center">
          <div
            className="cursor-pointer mr-4 text-3xl"
            onClick={() => {
              closable && toggleVisible()
              toggleListVisible && toggleListVisible()
            }}
          >
            🔖
          </div>
          <span>{modalType}</span>
        </div>
      )}
      onOk={save}
      closable={closable}
      onCancel={toggleVisible}
      className={`${prefixCls}-modal`}
      footer={(
        <ModalFooter
          save={save}
          create={create}
          toggle={toggleVisible}
          disabled={disabled}
          closable={closable}
          handleDelete={handleDelete}
        />
      )}
    >
      <Form
        form={form}
        colon={false}
        className="my-6"
        labelCol={{ span: 4 }}
        labelAlign="left"
        onValuesChange={onValueChange}
      >
        <Form.Item name="title" label="名称">
          <Input
            onKeyUp={e => e.stopPropagation()}
            onKeyDown={e => e.stopPropagation()}
          />
        </Form.Item>
        <Form.Item name="parentId" label="文件夹">
          <TreeSelect
            showSearch
            treeData={treeNodeDirs}
            onKeyUp={e => e.stopPropagation()}
            onKeyDown={e => e.stopPropagation()}
            treeNodeFilterProp="originalTitle"
            popupClassName={`${prefixCls}-tree-select-popup`}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

const ModalFooter = props => {
  const { handleDelete, save, toggle, disabled, create, closable } = props
  return (
    <div className="flex justify-between">
      {!create && (
        <Button
          danger
          shape="round"
          className="ml-0"
          onClick={handleDelete}
        >
          移除
        </Button>
      )}
      <div className="flex-1">
        {closable && (
          <Button onClick={toggle} shape="round">取消</Button>
        )}
        <Button
          type='primary'
          shape="round"
          disabled={disabled}
          onClick={save}
          className="ml-2"
        >
          保存
        </Button>
      </div>
    </div>
  )
}

export default Create