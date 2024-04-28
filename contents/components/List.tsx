import React from "react"
import { useStorage } from "@plasmohq/storage/hook"
import { Tooltip, Modal, Button, Input, Tree } from 'antd'
import { type TreeDataNode, type InputRef } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { debounce } from 'radash'
import { MessageActionEnum, formatBookmarkTreeNodes, baseZIndex } from '~/utils'

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

const matchTitle = (searchValue: string, treeNode: TreeDataNode[] = [], sensitive) => {
  return treeNode.reduce((currentValue, item) => {
    const { title, children } = item
    if (!title) return currentValue
    const strTitle = title as string
    const lTitle = sensitive ? strTitle : strTitle.toLowerCase()
    const lSearchValue = sensitive ? searchValue : searchValue.toLowerCase()
    const matched = lTitle.includes(lSearchValue)
    const matchedChildren = matchTitle(searchValue, children, sensitive)
    
    if (matched || matchedChildren.length) {
      const index = lTitle.indexOf(lSearchValue);
      const beforeStr = strTitle.substring(0, index);
      const afterStr = strTitle.slice(index + searchValue.length);
      const newTitle = (
        <span>
          {beforeStr}
          <span
            style={{ color: "red", fontWeight: 900 }}
            className="site-tree-search-value"
          >
            {searchValue}
          </span>
          {afterStr}
        </span>
      )

      currentValue.push({
        ...item,
        title: matched ? newTitle : title,
        children: matchedChildren
      })
    }
    return currentValue
  }, [])
}

const removeEmptyNode = (treeData = []) => {
  return treeData.reduce((currentValue, item) => {
    if (!item) return currentValue
    const { children = [], url } = item
    if (url) {
      currentValue.push(item)
      return currentValue
    }
    if (children.length) {
      const nodes = removeEmptyNode(children)
      if (nodes) {
        currentValue.push({
          ...item,
          children: nodes
        })
      }
    }
    return currentValue
  }, [])
}

interface ListProps {
  visible: boolean
  toggleVisible: () => void
}

const List: React.FC<ListProps> = props => {
  const { visible, toggleVisible } = props
  const [dataSource, setDataSource] = React.useState([])
  const [searchValue, setSearchValue] = React.useState('');
  const [expandedKeys, setExpandedKeys] = React.useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = React.useState(true);
  const [sensitive, setSensitive] = useStorage("case-sensitive", false)
  console.log('sensitive: =====', sensitive);

  const searchInputRef = React.useRef<InputRef>()

  React.useEffect(() => {
    if (!visible) return
    init()
    setTimeout(() => {
      searchInputRef.current.focus()
    }, 500);
  }, [visible])

  const matchedNodes = React.useMemo(() => {
    if (!searchValue) return dataSource
    const matchedNodes = matchTitle(searchValue, dataSource, sensitive)
    const filteredNodes = removeEmptyNode(matchedNodes)
    return filteredNodes
  }, [searchValue, dataSource, sensitive])

  const init = () => {
    chrome.runtime.sendMessage({
      action: MessageActionEnum.BOOKMARK_GET_TREE
    }, treeNodes => {
      const formattedTreeNodes = formatBookmarkTreeNodes(treeNodes, true)[0].children
      setDataSource(formattedTreeNodes)
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
      setExpandedKeys([])
      return
    }
    const keys = getKeys(value, dataSource)
    setExpandedKeys(keys)
  };

  return (
    <Modal
      zIndex={baseZIndex}
      width={800}
      open={visible}
      footer={null}
      title="书签列表"
      onCancel={toggleVisible}
      className="bookmark-list-modal"
    >
      <div>
        <Input
          ref={searchInputRef}
          size="middle"
          placeholder="搜索书签"
          style={{ margin: "8px 0 16px 0", borderRadius: 24 }}
          onChange={debounce({ delay: 300 }, onChange)}
          prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,.25)', marginRight: 4 }} />}
          suffix={
            <Tooltip zIndex={baseZIndex} title="区分大小写">
              <Button
                type="text"
                style={{ color: 'rgba(0,0,0,.45)', background: sensitive ? "rgba(0, 0, 0, 0.15)": "" }}
                shape="circle"
                onClick={() => setSensitive(!sensitive)}
              >
                Aa
              </Button>
            </Tooltip>
          }
        />
        <DirectoryTree
          draggable
          blockNode
          onExpand={onExpand}
          treeData={matchedNodes}
          expandedKeys={expandedKeys}
          autoExpandParent={autoExpandParent}
        />
      </div>
    </Modal>
  )
}


export default List