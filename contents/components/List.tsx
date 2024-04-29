import React from "react"
import { useStorage } from "@plasmohq/storage/hook"
import { Tooltip, Modal, Button, Input, Tree } from 'antd'
import { type TreeDataNode, type InputRef } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { debounce } from 'radash'
import { MessageActionEnum, formatBookmarkTreeNodes, baseZIndex, removeEmptyNode } from '~/utils'

const { DirectoryTree } = Tree;


type TreeNodeProps = TreeDataNode & chrome.bookmarks.BookmarkTreeNode

const getKeys = (treeNode = []) => {
  return treeNode.reduce((currentValue, item) => {
    const { children, key, url } = item
    if (!url) {
      currentValue.push(key)
    }
    const keys = getKeys(children)
    currentValue.push(...keys)
    return currentValue
  }, [])
}

const matchSearch = (searchValue: string, treeNode = [], options) => {
  const { sensitive, parentMatched } = options
  return treeNode.reduce((currentValue, item) => {
    const { url, originalTitle, children = [] } = item
    if (!originalTitle) return currentValue
    const strTitle = originalTitle as string
    const lTitle = sensitive ? strTitle : strTitle.toLowerCase()
    const lSearchValue = sensitive ? searchValue : searchValue.toLowerCase()
    const matched = lTitle.includes(lSearchValue)
    const matchedChildren = matchSearch(searchValue, children as TreeNodeProps[], {
      ...options,
      parentMatched: matched
    })

    if (matched || matchedChildren.length) {
      const index = lTitle.indexOf(lSearchValue);
      const beforeStr = strTitle.substring(0, index);
      const afterStr = strTitle.slice(index + searchValue.length);
      const newTitle = (
        <span>
          {beforeStr}
          <span style={{ color: "red", fontWeight: 900 }}>
            {searchValue}
          </span>
          {afterStr}
        </span>
      )

      currentValue.push({
        ...item,
        title: matched ? newTitle : originalTitle,
        children: matchedChildren
      })
    }
    // if (!matched && parentMatched) {
    //   currentValue.push(item)
    // }
    return currentValue
  }, [])
}

const formattedTreeNodesTitle = (treeNodes = []) => {
  return treeNodes.reduce((currentValue, item) => {
    const { children = [], url, title } = item
    if (url) {
      currentValue.push({
        ...item,
        title: (
          <a style={{ color: "inherit" }} type="link" href={url} target="_blank">
            {title}
          </a>
        ),
      })
    } else {
      currentValue.push({
        ...item,
        children: formattedTreeNodesTitle(children),
      })
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
    const matchedNodes = matchSearch(searchValue, dataSource, {
      sensitive
    })
    return formattedTreeNodesTitle(matchedNodes)
    // const filteredNodes = removeEmptyNode(matchedNodes)
    // return matchedNodes
  }, [searchValue, dataSource, sensitive])

  React.useEffect(() => {
    if (!searchValue) {
      setExpandedKeys([])
      return
    }
    const keys = getKeys(matchedNodes)
    setExpandedKeys(keys)
  }, [matchedNodes, searchValue])

  const init = () => {
    chrome.runtime.sendMessage({
      action: MessageActionEnum.BOOKMARK_GET_TREE
    }, treeNodes => {
      const formattedTreeNodes = formatBookmarkTreeNodes(treeNodes, true)[0].children
      const jsxNodes = formattedTreeNodesTitle(formattedTreeNodes)
      setDataSource(jsxNodes)
    });
  }

  const onExpand = (newExpandedKeys: React.Key[]) => {
    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(false);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setSearchValue(value)
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
                style={{ color: 'rgba(0,0,0,.45)', background: sensitive ? "rgba(0, 0, 0, 0.15)" : "" }}
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
          checkedKeys={[]}
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