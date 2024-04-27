import React from "react"
import { Button, Modal, Form, Input, TreeSelect } from 'antd'
import { MessageActionEnum, formatBookmarkTreeNodes, findTreeNode } from '~/utils'


interface ListProps {
  visible: boolean
  toggleVisible: () => void
}

const List: React.FC<ListProps> = props => {
  const { visible, toggleVisible } = props
  const [treeNodes, setTreeNodes] = React.useState([])

  React.useEffect(() => {
    if (!visible) return
    init()
  }, [visible])

  const init = () => {
    chrome.runtime.sendMessage({
      action: MessageActionEnum.BOOKMARK_GET_TREE
    }, treeNodes => {
      setTreeNodes(treeNodes)
    });
  }

  return (
    <Modal
      width={800}
      open={visible}
      footer={null}
      title="书签列表"
      onCancel={toggleVisible}
      className="bookmark-list-modal"
    >
      <div>1234</div>
    </Modal>
  )
}


export default List