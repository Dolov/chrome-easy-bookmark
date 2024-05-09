import React from "react"
import { useStorage } from "@plasmohq/storage/hook"
import { Tooltip, Modal, Button, Input, Tree } from 'antd'
import { type TreeDataNode, type InputRef, type TreeProps } from 'antd'
import {
  SearchOutlined, AlignLeftOutlined, AlignRightOutlined, AlignCenterOutlined,
} from '@ant-design/icons'
import { debounce } from 'radash'
import {
  MessageActionEnum, formatBookmarkTreeNodes, baseZIndex,
  StorageKeyEnum, SearchTypeEnum, searchTypeState,
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
          <span className="text-red-500 font-black">
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
  const [searchValue, setSearchValue] = React.useState('');
  const [expandedKeys, setExpandedKeys, expandedKeysRef] = useRefState([])
  const [editingBookmark, setEditingBookmark] = React.useState<chrome.bookmarks.BookmarkTreeNode>()
  const [autoExpandParent, setAutoExpandParent] = React.useState(true);
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
    if (!searchValue) {
      const jsxNodes = formattedTreeNodesTitle(dataSource, {
        onSuccess: init,
        setNodeExpand,
        editingBookmark,
        setEditingBookmark,
      })
      return jsxNodes
    }

    const matchedNodes = matchSearch(searchValue, dataSource, {
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
    searchValue, dataSource, sensitive, searchType,
    editingBookmark,
  ])

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
        <Input
          onChange={debounce({ delay: 300 }, onChange)}
        />

        <SearchInput
          ref={searchInputRef}
          placeholder="通过关键字检索书签"
          prefix={<SearchOutlined className="mr-1 text-slate-500" />}
          onPressEnter={init}
          suffix={
            <div className="actions">
              <CaseSensitive />
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