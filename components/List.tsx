import React from "react"
import { useStorage } from "@plasmohq/storage/hook"
import { Tooltip, Modal, Button, Input, Tree } from 'antd'
import { type TreeDataNode, type InputRef } from 'antd'
import { SearchOutlined, AlignLeftOutlined, AlignRightOutlined, AlignCenterOutlined, DeleteOutlined, InfoCircleFilled } from '@ant-design/icons'
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
              <a className="hover:text-blue-500 hover:underline text-inherit" type="link" href={url} target="_blank">
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
  toggleVisible?: () => void
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
      closable={!!toggleVisible}
      onCancel={toggleVisible}
      className={`${prefixCls}-modal`}
    >
      <div>
        <Input
          ref={searchInputRef}
          size="middle"
          className="flex rounded-3xl mt-2 mb-4"
          onKeyUp={e => e.stopPropagation()}
          onKeyDown={e => e.stopPropagation()}
          placeholder="搜索书签"
          onPressEnter={init}
          onChange={debounce({ delay: 300 }, onChange)}
          prefix={<SearchOutlined className="mr-1 text-slate-500" />}
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

const TreeNodeTitleContainer = props => {
  const { title, node, onSuccess } = props
  const { url, id, children } = node
  const [visible, setVisible] = React.useState(false)

  /** 两个根节点不能操作 */
  const actionVisible = !["1", "2"].includes(id)

  const deleteNode = (folder = false) => {
    const action = folder ? MessageActionEnum.BOOKMARK_REMOVE_TREE : MessageActionEnum.BOOKMARK_REMOVE
    chrome.runtime.sendMessage({
      action,
      id: node.id
    }).then(res => {
      onSuccess()
    })
  }

  const handleDelete = e => {
    e.stopPropagation()
    if (url) {
      deleteNode()
      return
    }
    if (
      !children.length ||
      children.length === 1
    ) {
      deleteNode(true)
      return
    }
    setVisible(true)
  }

  return (
    <div className="flex group">
      <span>{title}</span>
      {actionVisible && (
        <div className="flex-1 justify-end flex">
          <Button
            type="text"
            shape="circle"
            onClick={handleDelete}
            className="w-6 h-6 !min-w-6 justify-center items-center hidden group-hover:flex"
          >
            <DeleteOutlined />
          </Button>
        </div>
      )}
      <Modal
        open={visible}
        onOk={e => {
          e.stopPropagation()
          deleteNode(true)
        }}
        okText="确定"
        cancelText="取消"
        title={(
          <p className="flex items-center">
            <InfoCircleFilled className="text-yellow-500 mr-2 text-xl" />
            <span>确定删除该目录？</span>
          </p>
        )}
        onCancel={e => {
          e.stopPropagation()
          setVisible(false)
        }}
      >
        <div>
          该目录下存在 {children.length} 个书签和子目录，删除后无法恢复，请谨慎操作。
        </div>
      </Modal>
    </div>
  )
}


export default List