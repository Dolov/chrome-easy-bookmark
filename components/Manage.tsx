import React from "react"
import { useStorage } from "@plasmohq/storage/hook"
import { Tooltip, Modal, Button, Tree } from 'antd'
import { type TreeDataNode, type TreeProps } from 'antd'
import {
  SearchOutlined, AlignLeftOutlined, AlignRightOutlined, AlignCenterOutlined,
} from '@ant-design/icons'
import { debounce } from 'radash'
import {
  MessageActionEnum, formatBookmarkTreeNodes, baseZIndex,
  StorageKeyEnum, SearchTypeEnum, searchTypeState, highlightText
} from '~/utils'
import SearchInput, { type SearchInputRefProps } from './SearchInput'

import { useRefState } from './hooks'
import TreeNodeTitleContainer from './TreeNodeTitleContainer'

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

const matchSearch = (keywords: string[], treeNode: TreeNodeProps[] = [], options) => {
  const { sensitive, parentMatched, searchType, union } = options

  const result: TreeNodeProps[] = []
  for (let index = 0; index < treeNode.length; index++) {
    const itemNode = treeNode[index];
    const { url, children = [], title } = itemNode
    const originalTitle: string = (itemNode as any).originalTitle
    if (!originalTitle) return result
    const lTitle = sensitive ? originalTitle : originalTitle.toLowerCase()

    let matched = false
    // 并集检索
    if (union) {
      matched = keywords.some(keyword => lTitle.includes(keyword.toLowerCase()))
    } else {
      matched = keywords.every(keyword => lTitle.includes(keyword.toLowerCase()))
    }

    const matchedChildren = matchSearch(keywords, children as TreeNodeProps[], {
      ...options,
      parentMatched: parentMatched || matched
    })

    const push = () => {
      const text = highlightText(originalTitle, keywords, sensitive)

      result.push({
        ...itemNode,
        // @ts-ignore
        title: <span dangerouslySetInnerHTML={{ __html: text }} />,
        children: matchedChildren
      })
    }

    if (searchType === SearchTypeEnum.URL) {
      if (matched || matchedChildren.length) {
        push()
        continue
      }
    }

    if (searchType === SearchTypeEnum.DIR) {
      if (url && parentMatched) {
        push()
        continue
      }
      if (!url && (matched || parentMatched || matchedChildren.length)) {
        push()
        continue
      }
    }

    if (searchType === SearchTypeEnum.MIXIN) {
      if (matched || matchedChildren.length || parentMatched) {
        push()
        continue
      }
    }
  }
  return result
}

const formattedTreeNodesTitle = (treeNodes = [], options) => {
  const { onSuccess, setNodeExpand, editingBookmark, setEditingBookmark } = options
  return treeNodes.reduce((currentValue, item) => {
    const { children = [], url, title } = item
    let titleJsx = title
    if (url) {
      titleJsx = (
        <a className="hover:text-blue-500 hover:underline text-inherit" type="link" href={url} target="_blank">
          {title}
        </a>
      )
    }
    currentValue.push({
      ...item,
      title: (
        <TreeNodeTitleContainer
          node={item}
          onSuccess={onSuccess}
          setNodeExpand={setNodeExpand}
          editingBookmark={editingBookmark}
          setEditingBookmark={setEditingBookmark}
        >
          {titleJsx}
        </TreeNodeTitleContainer>
      ),
      children: formattedTreeNodesTitle(children, options),
    })
    return currentValue
  }, [])
}

interface ManageProps {
  visible: boolean
  toggleVisible?: () => void
}

const Manage: React.FC<ManageProps> = props => {
  const { visible, toggleVisible } = props
  const [dataSource, setDataSource] = React.useState([])
  const [keywords, setKeywords] = React.useState([]);
  const [expandedKeys, setExpandedKeys, expandedKeysRef] = useRefState([])
  const [editingBookmark, setEditingBookmark] = React.useState<chrome.bookmarks.BookmarkTreeNode>()
  const [autoExpandParent, setAutoExpandParent] = React.useState(true);
  const [union] = useStorage(StorageKeyEnum.UNION, true)
  const [sensitive] = useStorage(StorageKeyEnum.CASE_SENSITIVE, false)
  const [searchType] = useStorage(StorageKeyEnum.SEARCH_TYPE, SearchTypeEnum.MIXIN)
  const searchInputRef = React.useRef<SearchInputRefProps>()

  const init = () => {
    chrome.runtime.sendMessage({
      action: MessageActionEnum.BOOKMARK_GET_TREE
    }, treeNodes => {
      if (!treeNodes) return
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

  const setNodeExpand = (key: React.Key) => {
    if (expandedKeysRef.current.includes(key)) return
    setExpandedKeys([
      ...expandedKeysRef.current,
      key
    ]);
  };

  const matchedNodes = React.useMemo(() => {
    if (!keywords.length) {
      const jsxNodes = formattedTreeNodesTitle(dataSource, {
        onSuccess: init,
        setNodeExpand,
        editingBookmark,
        setEditingBookmark,
      })
      return jsxNodes
    }

    const matchedNodes = matchSearch(keywords, dataSource, {
      union,
      sensitive,
      searchType,
    })

    return formattedTreeNodesTitle(matchedNodes, {
      onSuccess: init,
      setNodeExpand,
      editingBookmark,
      setEditingBookmark,
    })
  }, [
    keywords, dataSource, sensitive, searchType,
    editingBookmark, union,
  ])

  React.useEffect(() => {
    if (!keywords.length) {
      setExpandedKeys([])
      return
    }
    const keys = getKeys(matchedNodes)
    setExpandedKeys(keys)
  }, [keywords])

  const onExpand = (newExpandedKeys: React.Key[]) => {
    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(false);
  };

  const onChange = (keywords: string[]) => {
    setKeywords(keywords)
  };

  const allowDrop: TreeProps['allowDrop'] = info => {
    if (!info.dropNode.isLeaf) return true
    // 不允许拖拽到叶子节点内
    if (
      info.dropNode.isLeaf &&
      info.dropPosition === 0
    ) {
      return false
    }
    return true
  }

  const onDrop: TreeProps['onDrop'] = info => {
    // drop 元素的末级顺序
    const index = info.dropPosition
    // 被拖拽元素的 key
    const dragKey = info.dragNode.key
    // 平为 true, 缩为 false
    const dropToGap = info.dropToGap
    const payload: Record<string, any> = {
      id: dragKey,
    }

    if (dropToGap) {
      payload.index = index
      payload.parentId = info.node.parentId
    } else {
      payload.index = 0
      payload.parentId = info.node.key
    }

    chrome.runtime.sendMessage({
      payload,
      action: MessageActionEnum.BOOKMARK_MOVE,
    }).then(res => {
      init()
    })
  };

  return (
    <Modal
      zIndex={baseZIndex}
      width={800}
      open={visible}
      footer={null}
      title="书签管理"
      closable={!!toggleVisible}
      onCancel={toggleVisible}
      className={`${prefixCls}-modal`}
    >
      <div>
        <SearchInput
          ref={searchInputRef}
          onChange={debounce({ delay: 300 }, onChange)}
          placeholder="输入关键字，点击 Enter 检索"
          prefix={<SearchOutlined className="text-slate-500" />}
          onPressEnter={init}
          suffix={
            <div className="actions flex">
              <CaseSensitive />
              <span className="ml-1">
                <Union />
              </span>
              <span className="ml-1">
                <SearchType />
              </span>
            </div>
          }
        />
        <DirectoryTree
          draggable
          blockNode
          selectedKeys={[]}
          checkedKeys={[]}
          onDrop={onDrop}
          onExpand={onExpand}
          treeData={matchedNodes}
          allowDrop={allowDrop}
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
        className={`text-slate-500 ${sensitive ? "bg-slate-200" : ""} hover:!bg-slate-200`}
        shape="circle"
        onClick={() => setSensitive(!sensitive)}
      >
        Aa
      </Button>
    </Tooltip>
  )
}

const Union = () => {
  const [union, setUnion] = useStorage(StorageKeyEnum.UNION, true)
  const title = union ? "并集" : "交集"
  return (
    <Tooltip zIndex={baseZIndex} title={title}>
      <Button
        type="text"
        className={`text-slate-500 flex items-center justify-center ${!union ? "bg-slate-200" : ""} hover:!bg-slate-200`}
        shape="circle"
        onClick={() => setUnion(!union)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 14" height="1em" width="1em">
          <path d="M7 14A7 7 0 1 1 10 .674a7 7 0 1 1 0 12.653A6.973 6.973 0 0 1 7 14ZM7 2a5 5 0 1 0 1 9.9A6.977 6.977 0 0 1 6 7a6.98 6.98 0 0 1 2-4.9A5.023 5.023 0 0 0 7 2Zm7 5a6.977 6.977 0 0 1-2 4.9 5 5 0 1 0 0-9.8A6.977 6.977 0 0 1 14 7Z"/>
        </svg>
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
        className="text-slate-500 bg-slate-200 hover:!bg-slate-200"
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

export default Manage