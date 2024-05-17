import React from "react"
import { useStorage } from "@plasmohq/storage/hook"
import { Modal, Tree } from 'antd'
import { type TreeProps } from 'antd'
import {
  SearchOutlined
} from '@ant-design/icons'
import { debounce } from 'radash'
import {
  MessageActionEnum, formatBookmarkTreeNodes, baseZIndex,
  StorageKeyEnum, SearchTypeEnum, highlightText,
  type TreeNodeProps
} from '~/utils'
import SearchInput, { type SearchInputRefProps } from './SearchInput'

import { useRefState, useUpdateEffect } from './hooks'
import TreeNodeTitleContainer from './TreeNodeTitleContainer'
import { CaseSensitive, Union, SearchType } from './SearchCondition'
import HandlerBar from './HandlerBar'

const { DirectoryTree } = Tree;

const prefixCls = "list-container"


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
  const { sensitive, parentMatched, searchType, union, editingBookmark } = options

  const result: TreeNodeProps[] = []
  for (let index = 0; index < treeNode.length; index++) {
    const itemNode = treeNode[index];
    const { url, title, children = [] } = itemNode
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

    if (editingBookmark?.id === itemNode?.id) {
      push()
      continue
    }
  }
  return result
}

const formattedTreeNodesTitle = (treeNodes = [], options) => {
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
          {...options}
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
  const [dataSource, setDataSource] = React.useState<TreeNodeProps[]>([])
  const [keywords, setKeywords, keywordsRef] = useRefState<string[]>([])
  const [expandedKeys, setExpandedKeys, expandedKeysRef] = useRefState([])
  const [checkedKeys, setCheckedKeys, checkedKeysRef] = useRefState([])
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
    }, 400);
  }, [visible])

  const setNodeExpand = (key: React.Key) => {
    if (expandedKeys.includes(key)) return
    setExpandedKeys([
      ...expandedKeys,
      key
    ]);
  };

  const addKeyword = (title: string) => {
    searchInputRef.current.addKeyword(title)
  }

  useUpdateEffect(() => {
    if (!keywords.length) {
      setExpandedKeys([])
      return
    }
    const keys = getKeys(matchedNodes)
    setExpandedKeys(keys)
  }, [keywords])

  const matchedNodes = React.useMemo(() => {
    const options = {
      onSuccess: init,
      addKeyword,
      dataSource,
      setNodeExpand,
      setCheckedKeys,
      checkedKeysRef,
      editingBookmark,
      setEditingBookmark,
    }
    if (!keywords.length) {
      const jsxNodes = formattedTreeNodesTitle(dataSource, options)
      return jsxNodes
    }

    const matchedNodes = matchSearch(keywords, dataSource, {
      union,
      sensitive,
      searchType,
      editingBookmark,
    })

    return formattedTreeNodesTitle(matchedNodes, options)
  }, [
    keywords, dataSource, sensitive, searchType,
    editingBookmark, union,
  ])

  const onExpand = (newExpandedKeys: React.Key[]) => {
    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(false);
  };

  const onChange = (words: string[]) => {
    // 判断搜索值不相等时，才触发搜索
    if (words.join() === keywords.join()) return
    setKeywords(words)
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
        <HandlerBar
          onSuccess={init}
          dataSource={dataSource}
          checkedKeys={checkedKeys}
          setNodeExpand={setNodeExpand}
          setCheckedKeys={setCheckedKeys}
        />
        <DirectoryTree
          draggable
          blockNode
          multiple
          checkable
          onCheck={setCheckedKeys}
          checkedKeys={checkedKeys}
          selectedKeys={[]}
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


export default Manage