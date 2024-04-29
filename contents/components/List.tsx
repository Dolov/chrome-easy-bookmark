import React from "react"
import { useStorage } from "@plasmohq/storage/hook"
import { Tooltip, Modal, Button, Input, Tree } from 'antd'
import { type TreeDataNode, type InputRef } from 'antd'
import { SearchOutlined, AlignLeftOutlined, AlignRightOutlined, AlignCenterOutlined, DeleteOutlined, DeleteFilled } from '@ant-design/icons'
import { debounce } from 'radash'
import {
  MessageActionEnum, formatBookmarkTreeNodes, baseZIndex,
  StorageKeyEnum, SearchTypeEnum, searchTypeState,
} from '~/utils'

const { DirectoryTree } = Tree;

const prefixCls = "list-container"

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
  const { sensitive, parentMatched, searchType } = options
  return treeNode.reduce((currentValue, item) => {
    const { url, originalTitle, children = [], title } = item
    if (!originalTitle) return currentValue
    const strTitle = originalTitle as string
    const lTitle = sensitive ? strTitle : strTitle.toLowerCase()
    const lSearchValue = sensitive ? searchValue : searchValue.toLowerCase()
    const matched = lTitle.includes(lSearchValue)
    const matchedChildren = matchSearch(searchValue, children as TreeNodeProps[], {
      ...options,
      parentMatched: parentMatched || matched
    })

    const push = () => {
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
        title: matched ? newTitle : title,
        children: matchedChildren
      })
    }

    if (searchType === SearchTypeEnum.URL) {
      if (matched || matchedChildren.length) {
        push()
        return currentValue
      }
    }

    if (searchType === SearchTypeEnum.DIR) {
      if (url && parentMatched) {
        push()
        return currentValue
      }
      if (!url && (matched || parentMatched || matchedChildren.length)) {
        push()
        return currentValue
      }
    }

    if (searchType === SearchTypeEnum.MIXIN) {
      if (matched || matchedChildren.length || parentMatched) {
        push()
        return currentValue
      }
    }

    return currentValue
  }, [])
}

const formattedTreeNodesTitle = (treeNodes = [], options) => {
  const { onSuccess } = options
  return treeNodes.reduce((currentValue, item) => {
    const { children = [], url, title } = item
    if (url) {
      currentValue.push({
        ...item,
        title: (
          <TreeNodeTitleContainer
            node={item}
            onSuccess={onSuccess}
            title={(
              <a style={{ color: "inherit" }} type="link" href={url} target="_blank">
                {title}
              </a>
            )}
          />
        ),
      })
    } else {
      currentValue.push({
        ...item,
        title: (
          <TreeNodeTitleContainer
            onSuccess={onSuccess}
            node={item}
            title={title}
          />
        ),
        children: formattedTreeNodesTitle(children, options),
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
  const [sensitive] = useStorage(StorageKeyEnum.CASE_SENSITIVE, false)
  const [searchType] = useStorage(StorageKeyEnum.SEARCH_TYPE, SearchTypeEnum.MIXIN)
  const searchInputRef = React.useRef<InputRef>()

  const init = () => {
    chrome.runtime.sendMessage({
      action: MessageActionEnum.BOOKMARK_GET_TREE
    }, treeNodes => {
      const formattedTreeNodes = formatBookmarkTreeNodes(treeNodes, true)[0].children
      setDataSource(formattedTreeNodes)
    });
  }

  React.useEffect(() => {
    if (!visible) return
    init()
    setTimeout(() => {
      searchInputRef.current.focus()
    }, 500);
  }, [visible])

  const matchedNodes = React.useMemo(() => {
    if (!searchValue) {
      const jsxNodes = formattedTreeNodesTitle(dataSource, {
        onSuccess: init
      })
      return jsxNodes
    }

    const matchedNodes = matchSearch(searchValue, dataSource, {
      sensitive,
      searchType,
    })
    return formattedTreeNodesTitle(matchedNodes, {
      onSuccess: init
    })
  }, [searchValue, dataSource, sensitive, searchType])

  React.useEffect(() => {
    if (!searchValue) {
      setExpandedKeys([])
      return
    }
    const keys = getKeys(matchedNodes)
    setExpandedKeys(keys)
  }, [searchValue])

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
      className={`${prefixCls}-modal`}
    >
      <div>
        <Input
          ref={searchInputRef}
          size="middle"
          style={{ margin: "8px 0 16px 0", borderRadius: 24 }}
          onKeyUp={e => e.stopPropagation()}
          onKeyDown={e => e.stopPropagation()}
          placeholder="搜索书签"
          onChange={debounce({ delay: 300 }, onChange)}
          prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,.25)', marginRight: 4 }} />}
          suffix={
            <div className="actions">
              <CaseSensitive />
              <span style={{ marginLeft: 4 }}>
                <SearchType />
              </span>
            </div>
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

const CaseSensitive = () => {
  const [sensitive, setSensitive] = useStorage(StorageKeyEnum.CASE_SENSITIVE, false)
  const title = sensitive ? "区分大小写" : "不区分大小写"
  return (
    <Tooltip zIndex={baseZIndex} title={title}>
      <Button
        type="text"
        style={{ color: 'rgba(0,0,0,.45)', background: sensitive ? "rgba(0, 0, 0, 0.15)" : "" }}
        shape="circle"
        onClick={() => setSensitive(!sensitive)}
      >
        Aa
      </Button>
    </Tooltip>
  )
}

const SearchType = () => {
  const [type, setType] = useStorage(StorageKeyEnum.SEARCH_TYPE, SearchTypeEnum.MIXIN)

  const titleMap = {
    [SearchTypeEnum.URL]: "标题匹配",
    [SearchTypeEnum.DIR]: "目录匹配",
    [SearchTypeEnum.MIXIN]: "混合匹配",
  }

  const toggleType = () => {
    const nextType = searchTypeState[type].next()
    setType(nextType)
  }

  return (
    <Tooltip zIndex={baseZIndex} title={titleMap[type]}>
      <Button
        type="text"
        style={{ color: 'rgba(0,0,0,.45)', background: "rgba(0, 0, 0, 0.15)" }}
        shape="circle"
        onClick={toggleType}
      >
        {type === SearchTypeEnum.URL && <AlignLeftOutlined />}
        {type === SearchTypeEnum.DIR && <AlignRightOutlined />}
        {type === SearchTypeEnum.MIXIN && <AlignCenterOutlined />}
      </Button>
    </Tooltip>
  )
}

const TreeNodeTitleContainer = props => {
  const { title, node, onSuccess } = props
  const { url } = node

  const handleDelete = e => {
    e.stopPropagation()
    chrome.runtime.sendMessage({
      action: MessageActionEnum.BOOKMARK_DELETE,
      id: node.id
    }).then(res => {
      onSuccess()
    })
  }

  return (
    <div style={{ display: "flex" }}>
      <span>{title}</span>
      <div style={{ flex: 1, justifyContent: "flex-end", display: "flex" }}>
        <Button
          danger
          type="text"
          shape="circle"
          onClick={handleDelete}
          style={{ width: 24, height: 24, minWidth: 24, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <DeleteOutlined />
        </Button>
      </div>
    </div>
  )
}


export default List