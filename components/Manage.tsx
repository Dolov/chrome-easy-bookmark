import React from "react"
import { useStorage } from "@plasmohq/storage/hook"
import { Tooltip, Modal, Button, Input, Tree, Dropdown } from 'antd'
import { type TreeDataNode, type InputRef, type TreeProps, type MenuProps } from 'antd'
import {
  SearchOutlined, AlignLeftOutlined, AlignRightOutlined, AlignCenterOutlined, DeleteOutlined,
  InfoCircleFilled, DeleteFilled, FolderAddFilled, EditFilled
} from '@ant-design/icons'
import { debounce } from 'radash'
import {
  MessageActionEnum, formatBookmarkTreeNodes, baseZIndex,
  StorageKeyEnum, SearchTypeEnum, searchTypeState,
} from '~/utils'
import TextInput from './TextInput'

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
  const { onSuccess, editingBookmark, setEditingBookmark } = options
  return treeNodes.reduce((currentValue, item) => {
    const { children = [], url, title } = item
    if (url) {
      currentValue.push({
        ...item,
        title: (
          <TreeNodeTitleContainer
            node={item}
            title={(
              <a className="hover:text-blue-500 hover:underline text-inherit" type="link" href={url} target="_blank">
                {title}
              </a>
            )}
            onSuccess={onSuccess}
            editingBookmark={editingBookmark}
            setEditingBookmark={setEditingBookmark}
          />
        ),
      })
    } else {
      currentValue.push({
        ...item,
        title: (
          <TreeNodeTitleContainer
            node={item}
            title={title}
            onSuccess={onSuccess}
            editingBookmark={editingBookmark}
            setEditingBookmark={setEditingBookmark}
          />
        ),
        children: formattedTreeNodesTitle(children, options),
      })
    }
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
  const [expandedKeys, setExpandedKeys] = React.useState<React.Key[]>([]);
  const [editingBookmark, setEditingBookmark] = React.useState<chrome.bookmarks.BookmarkTreeNode>()
  const [autoExpandParent, setAutoExpandParent] = React.useState(true);
  const [sensitive] = useStorage(StorageKeyEnum.CASE_SENSITIVE, false)
  const [searchType] = useStorage(StorageKeyEnum.SEARCH_TYPE, SearchTypeEnum.MIXIN)
  const searchInputRef = React.useRef<InputRef>()

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

  const matchedNodes = React.useMemo(() => {
    if (!searchValue) {
      const jsxNodes = formattedTreeNodesTitle(dataSource, {
        onSuccess: init,
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
    console.log('info: ', info);
    const index = info.dropPosition
    const dragKey = info.dragNode.key
    // 同级为 true, 子级为 false
    const dropToGap = info.dropToGap
    const dropParentId = (info.node as any).parentId
    const payload = {
      index,
      id: dragKey,
      parentId: dropParentId
    }
    if (!dropToGap && [0, 1, 2].includes(index)) {
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

const TreeNodeTitleContainer = props => {
  const { title, node, onSuccess, editingBookmark, setEditingBookmark } = props
  const { url, id, children } = node
  const [visible, setVisible] = React.useState(false)

  /** 两个根节点 */
  const rootNode = ["1", "2"].includes(id)

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

  const menuItems: MenuProps['items'] = React.useMemo(() => {
    const renameItem = {
      label: <div><EditFilled className="mr-2" />重命名</div>,
      key: 'rename',
    }
    const addFolderItem = {
      label: <div><FolderAddFilled className="mr-2" />添加文件夹</div>,
      key: 'add-folder',
    }
    const deleteItem = {
      label: <div className="text-red-500 font-medium"><DeleteFilled className="mr-2" />删除</div>,
      key: 'delete',
    }

    if (url) {
      return [renameItem, deleteItem]
    }

    if (rootNode) {
      return [
        addFolderItem,
      ]
    }

    return [
      renameItem,
      addFolderItem,
      deleteItem,
    ]
  }, [])

  const handleContextMenu = async e => {
    e.domEvent.stopPropagation()
    const { key } = e
    if (key === "rename") {
      setEditingBookmark(node)
    }
    if (key === "add-folder") {
      const newFolder = await chrome.runtime.sendMessage({
        action: MessageActionEnum.BOOKMARK_CREATE,
        payload: {
          title: "新建文件夹",
          parentId: id,
        }
      })
      setEditingBookmark(newFolder)
      onSuccess()
    }
    if (key === "delete") {
      handleDelete(e.domEvent)
    }
  }

  const onSave = async (value: string) => {
    if (!value) return
    setEditingBookmark(undefined)
    const res = await chrome.runtime.sendMessage({
      action: MessageActionEnum.BOOKMARK_UPDATE,
      payload: {
        id: editingBookmark.id,
        title: value
      }
    })
    onSuccess()
  }

  const { id: editId } = editingBookmark || {}
  const editing = editId === id

  return (
    <Dropdown menu={{ items: menuItems, onClick: handleContextMenu }} trigger={['contextMenu']}>
      <div className="flex group">
        <TextInput value={title} editing={editing} onSave={onSave} />
        {!rootNode && (
          <div className="flex-1 justify-end flex items-center">
            <Button
              type="text"
              shape="circle"
              onClick={handleDelete}
              className="w-6 h-6 !min-w-6 flex justify-center items-center invisible group-hover:visible"
            >
              <DeleteOutlined />
            </Button>
          </div>
        )}
        <div onClick={e => e.stopPropagation()}>
          <Modal
            centered
            open={visible}
            onOk={e => deleteNode(true)}
            okText="确定"
            cancelText="取消"
            title={(
              <p className="flex items-center">
                <InfoCircleFilled className="text-yellow-500 mr-2 text-xl" />
                <span>确定删除该目录？</span>
              </p>
            )}
            onCancel={e => setVisible(false)}
          >
            <div>
              该目录下存在 {children.length} 个书签和子目录，删除后无法恢复，请谨慎操作。
            </div>
          </Modal>
        </div>
      </div>
    </Dropdown>
  )
}


export default Manage