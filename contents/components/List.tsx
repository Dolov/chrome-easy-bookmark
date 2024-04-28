import React from "react"
import { Button, Modal, Form, Input, Tree } from 'antd'
import { type TreeDataNode } from 'antd'
import { MessageActionEnum, formatBookmarkTreeNodes, findTreeNode } from '~/utils'

const { Search } = Input;
const { DirectoryTree } = Tree;

const getKeys = (value: string, treeNode = [], parentKey?) => {
  return treeNode.reduce((currentValue, item) => {
    const { title, children, key, url } = item
    if (title.includes(value)) {
      if (url) {
        currentValue.push(parentKey)
      } else {
        currentValue.push(key)
      }
    }
    const keys = getKeys(value, children, key)
    currentValue.push(...keys)
    return currentValue
  }, [])
}

interface ListProps {
  visible: boolean
  toggleVisible: () => void
}

const List: React.FC<ListProps> = props => {
  const { visible, toggleVisible } = props
  const dataSourceRef = React.useRef()
  const [treeNodes, setTreeNodes] = React.useState([])
  const [searchValue, setSearchValue] = React.useState('');
  const [expandedKeys, setExpandedKeys] = React.useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = React.useState(true);


  React.useEffect(() => {
    if (!visible) return
    init()
  }, [visible])

  const init = () => {
    chrome.runtime.sendMessage({
      action: MessageActionEnum.BOOKMARK_GET_TREE
    }, treeNodes => {
      const formattedTreeNodes = formatBookmarkTreeNodes(treeNodes, true)[0].children
      dataSourceRef.current = formattedTreeNodes
      setTreeNodes(formattedTreeNodes)
    });
  }

  const onExpand = (newExpandedKeys: React.Key[]) => {
    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(false);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setSearchValue(value)
    if (!value) {
      setTreeNodes(dataSourceRef.current)
      setExpandedKeys([])
      return
    }
    const keys = getKeys(value, dataSourceRef.current)
    setExpandedKeys(keys)
  };

  return (
    <Modal
      width={800}
      open={visible}
      footer={null}
      title="书签列表"
      onCancel={toggleVisible}
      className="bookmark-list-modal"
    >
      <div>
        <Search style={{ marginBottom: 8 }} placeholder="Search" onChange={onChange} />
        <DirectoryTree
          draggable
          blockNode
          onExpand={onExpand}
          treeData={treeNodes}
          expandedKeys={expandedKeys}
          autoExpandParent={autoExpandParent}
        />
      </div>
    </Modal>
  )
}


export default List