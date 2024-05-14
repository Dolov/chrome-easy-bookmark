import React from "react"
import { useStorage } from "@plasmohq/storage/hook"
import { Button, Modal, Form, Input, TreeSelect } from 'antd'
import { useRefState } from '~components/hooks'
import { MessageActionEnum, formatBookmarkTreeNodes, findTreeNode, baseZIndex, StorageKeyEnum } from '~/utils'

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
  toggleVisible?: (visible?: boolean) => void
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
  const [editBookmark, setEditBookmark, editBookmarkRef] = useRefState<chrome.bookmarks.BookmarkTreeNode>()
  const [lastParentId, setLastParentId] = useStorage(StorageKeyEnum.LAST_PARENT_ID, DEFAULT_PARENT_ID)
  const visibleRef = React.useRef(visible)

  visibleRef.current = visible
  const closable = !!toggleVisible

  React.useEffect(() => {
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return
      if (!visibleRef.current) return
      if (editBookmarkRef.current) {
        toggleVisible(false)
        return
      }
      save()
    })
  }, [])

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
        if (!treeNodes) return
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
    const { parentId = lastParentId, title } = form.getFieldsValue()
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
      setLastParentId(parentId)
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
      parentId: lastParentId,
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
      cancelButtonProps={{
        onKeyUp: e => e.stopPropagation(),
        onKeyDown: e => e.stopPropagation(),
      }}
      closable={closable}
      onCancel={() => toggleVisible(false)}
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
            onPressEnter={save}
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
          onKeyUp={e => e.stopPropagation()}
          onKeyDown={e => e.stopPropagation()}
        >
          移除
        </Button>
      )}
      <div className="flex-1">
        {closable && (
          <Button
            shape="round"
            onClick={toggle}
            onKeyUp={e => e.stopPropagation()}
            onKeyDown={e => e.stopPropagation()}
          >
            取消
          </Button>
        )}
        <Button
          type='primary'
          shape="round"
          disabled={disabled}
          onClick={save}
          className="ml-2"
          onKeyUp={e => e.stopPropagation()}
          onKeyDown={e => e.stopPropagation()}
        >
          保存
        </Button>
      </div>
    </div>
  )
}

export default Create