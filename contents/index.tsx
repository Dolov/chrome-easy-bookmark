import React from "react"
import Mousetrap from 'mousetrap'
import { StyleProvider } from "@ant-design/cssinjs"
import { Button, Modal, Form, Input, TreeSelect } from 'antd'
import antdResetCssText from "data-text:antd/dist/reset.css"
import type { PlasmoCSConfig, PlasmoGetShadowHostId, PlasmoCSUIProps } from "plasmo"
import { useBoolean, MessageActionEnum, formatBookmarkTreeNodes, findTreeNode } from '../utils'

import { GlobalAntdProvider } from "~GlobalAntdProvider"

const HOST_ID = "easy-bookmark-host"
const DEFAULT_PARENT_ID = "1"

export const getShadowHostId: PlasmoGetShadowHostId = () => HOST_ID

const getRoot = () => document.getElementById(HOST_ID).shadowRoot as unknown as HTMLElement

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = antdResetCssText
  return style
}

const EngageOverlay = () => {
  const [ form ] = Form.useForm();
  const [visible, toggle, visibleRef] = useBoolean()
  const [disabled, setDisabled] = React.useState(false)
  const [treeNodes, setTreeNodes] = React.useState([])
  const [treeNodeDirs, setTreeNodeDirs] = React.useState([])
  const [bookmark, setBookmark] = React.useState<chrome.bookmarks.BookmarkTreeNode>()

  React.useEffect(() => {
    Mousetrap.bind(['command+s', 'ctrl+s'], function () {
      toggle()
      if (!visibleRef.current) return false
      init()
      return false;
    });
  }, [])

  const init = () => {
    chrome.runtime.sendMessage({
      action: MessageActionEnum.GET_BOOKMARK_TREE
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
    let action = MessageActionEnum.CREATE_BOOKMARK
    if (bookmark) {
      payload.id = bookmark.id
      action = MessageActionEnum.UPDATE_BOOKMARK
      if (bookmark.parentId !== parentId) {
        action = MessageActionEnum.MOVE_BOOKMARK
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
      toggle()
    });
  }

  const onValueChange = (changedValue, values) => {
    const disabled = !values.title || !values.parentId
    setDisabled(disabled)
  }

  const handleDelete = () => {
    chrome.runtime.sendMessage({
      id: bookmark.id,
      action: MessageActionEnum.DELETE_BOOKMARK,
    }, res => {
      init()
      toggle()
    });
  }

  const showAll = () => {

  }

  const create = !bookmark
  const modalType = create ? "新建书签" : "编辑书签"

  const { title = document.title, parentId = DEFAULT_PARENT_ID } = bookmark || {}

  return (
    <GlobalAntdProvider>
      <StyleProvider container={document.getElementById(HOST_ID).shadowRoot}>
        <Modal
          open={visible}
          getContainer={getRoot}
          title={(
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ fontSize: 32, cursor: 'pointer', marginRight: 16 }}>🔖</div>
              <span>{modalType}</span>
            </div>
          )}
          onOk={save}
          onCancel={toggle}
          footer={<ModalFooter handleDelete={handleDelete} save={save} toggle={toggle} disabled={disabled} create={create} />}
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
                showSearch
                treeData={treeNodeDirs}
                treeNodeFilterProp="title"
                getPopupContainer={getRoot}
              />
            </Form.Item>
          </Form>
        </Modal>
      </StyleProvider>
    </GlobalAntdProvider>
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
          autoFocus
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

export default EngageOverlay