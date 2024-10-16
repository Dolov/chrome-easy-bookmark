import React from 'react'
import { Button, Tooltip, message, Modal, TreeSelect } from 'antd'
import { ChromeFilled, InfoCircleFilled } from '@ant-design/icons'
import {
  type TreeNodeProps, getBookmarksToText, baseZIndex, formatBookmarkTreeNodes,
  copyTextToClipboard, MessageActionEnum, downloadBookmarkAsHtml
} from '~utils'
import {
  MaterialSymbolsDelete, MaterialSymbolsDriveFileMoveRounded,
  RiDownloadCloud2Fill, MaterialSymbolsContentCopyRounded
} from '~components/Icon'

export interface HandlerBarProps {
  onSuccess(): void
  dataSource: TreeNodeProps[]
  checkedKeys: string[]
  setNodeExpand: (key: React.Key) => void
  setCheckedKeys: (keys: string[]) => void
}

const getBookmarkList = (checkedKeys: string[], dataSource: TreeNodeProps[]) => {
  return dataSource.reduce((bookmarks, item) => {
    const { id, children } = item
    if (checkedKeys.includes(item.id)) {
      bookmarks.push(item)
    }
    if (item.children) {
      bookmarks = bookmarks.concat(getBookmarkList(checkedKeys, children))
    }
    return bookmarks
  }, [])
}

const getBookmarkTree = (dataSource: TreeNodeProps[]) => {
  const map = {};
  const tree = [];
  dataSource.forEach(item => {
    map[item.id] = { ...item, children: [] };
  });

  dataSource.forEach(item => {
    const { parentId, id } = item
    if (parentId && map[parentId]) {
      map[parentId].children.push(map[id]);
    } else {
      tree.push(map[id]);
    }
  });
  return tree;
}

const HandlerBar: React.FC<HandlerBarProps> = props => {
  const { checkedKeys, dataSource, onSuccess, setCheckedKeys, setNodeExpand } = props
  const [parentId, setParentId] = React.useState("")
  const [deleteModalVisible, setDeleteModalVisible] = React.useState(false)
  const [moveParentFolderModalVisible, setMoveParentFolderModalVisible] = React.useState(false)

  const visible = checkedKeys.length > 0

  const bookmarkList = React.useMemo(() => {
    if (!checkedKeys) return []
    if (!checkedKeys.length) return []
    return getBookmarkList(checkedKeys, dataSource)
  }, [checkedKeys, dataSource])

  const bookmarkTree = React.useMemo(() => {
    return getBookmarkTree(bookmarkList)
  }, [bookmarkList])

  const handleOpen = () => {
    bookmarkList.forEach(item => {
      const { url } = item
      if (url) window.open(url)
    })
  }

  const handleMove = async () => {
    if (!parentId) return
    for (let index = 0; index < bookmarkTree.length; index++) {
      const { id } = bookmarkTree[index];
      const res = await chrome.runtime.sendMessage({
        action: MessageActionEnum.BOOKMARK_MOVE,
        payload: {
          id,
          index: 0,
          parentId,
        }
      })
    }
    onSuccess()
    setNodeExpand(parentId)
    setMoveParentFolderModalVisible(false)
  }

  const handleCopy = () => {
    const text = getBookmarksToText(bookmarkList)
    copyTextToClipboard(text)
    message.success("复制成功。")
  }

  const onMove = () => {
    setMoveParentFolderModalVisible(true)
  }

  const onDelete = () => {
    setDeleteModalVisible(true)
  }

  const handleDelete = async () => {
    for (let index = 0; index < bookmarkList.length; index++) {
      const element = bookmarkList[index];
      const { url, id } = element
      const action = url ? MessageActionEnum.BOOKMARK_REMOVE : MessageActionEnum.BOOKMARK_REMOVE_TREE
      await chrome.runtime.sendMessage({
        id,
        action,
      })
    }
    onSuccess()
    setCheckedKeys([])
    setDeleteModalVisible(false)
  }

  const handleDownload = () => {
    downloadBookmarkAsHtml(bookmarkTree)
  }

  return (
    <div className="mb-2 min-h-[1]" onClick={e => e.stopPropagation()}>
      <MoveParentFolderModal
        visible={moveParentFolderModalVisible}
        onCancel={() => setMoveParentFolderModalVisible(false)}
        onOk={handleMove}
        value={parentId}
        onChange={setParentId}
        dataSource={dataSource}
      />
      <DeleteConfirmModal
        visible={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        dataSource={bookmarkTree}
      />
      {visible && (
        <div className="flex justify-between items-center">
          <span className="ml-2 font-bold">选中 {checkedKeys.length} 项</span>
          <div className="flex">
            <Tooltip title="打开选中书签">
              <Button onClick={handleOpen} className="center" type="text" shape="circle">
                <ChromeFilled className="center !flex text-lg text-gray-700" />
              </Button>
            </Tooltip>
            <Tooltip title="复制选中书签">
              <Button onClick={handleCopy} className="center" type="text" shape="circle">
                <MaterialSymbolsContentCopyRounded className="text-lg text-gray-700" />
              </Button>
            </Tooltip>
            <Tooltip title="移动选中书签">
              <Button onClick={onMove} className="center" type="text" shape="circle">
                <MaterialSymbolsDriveFileMoveRounded className="text-lg text-gray-700" />
              </Button>
            </Tooltip>
            <Tooltip title="下载选中书签">
              <Button onClick={handleDownload} className="center" type="text" shape="circle">
                <RiDownloadCloud2Fill className="text-lg text-gray-700" />
              </Button>
            </Tooltip>
            <Tooltip title="删除选中书签">
              <Button onClick={onDelete} className="center" type="text" shape="circle">
                <MaterialSymbolsDelete className="text-lg text-red-500" />
              </Button>
            </Tooltip>
          </div>
        </div>
      )}
    </div>
  )
}

interface DeleteConfirmModalProps {
  visible: boolean
  onOk: () => void
  onCancel: () => void
  dataSource: TreeNodeProps[]
  title?: React.ReactNode
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = props => {
  const { visible, onCancel, onOk, dataSource } = props

  const count = React.useMemo(() => {
    if (!dataSource) return 0
    const getCount = (nodes: TreeNodeProps[]) => {
      return nodes.reduce((currentValue, item) => {
        if (item.children) {
          return currentValue + 1 + getCount(item.children)
        }
        return currentValue + 1
      }, 0)
    }
    return getCount(dataSource)
  }, [dataSource])

  return (
    <Modal
      open={visible}
      onOk={onOk}
      okText="确定"
      cancelText="取消"
      zIndex={baseZIndex}
      title={(
        <p className="flex items-center">
          <InfoCircleFilled className="text-yellow-500 mr-2 text-xl" />
          <span>确定删除？</span>
        </p>
      )}
      onCancel={onCancel}
    >
      <div>共计 {count} 个文件夹及书签，删除后无法恢复，请谨慎操作。</div>
    </Modal>
  )
}

interface MoveParentFolderModalProps {
  visible: boolean
  onOk: () => void
  value: string
  onChange: (value: string) => void
  onCancel: () => void
  dataSource: TreeNodeProps[]
  title?: React.ReactNode
  excludeChildrenNodeId?: string
}

export const MoveParentFolderModal: React.FC<MoveParentFolderModalProps> = props => {
  const {
    visible, onCancel, onOk, dataSource, title = "选择上级文件夹",
    value, onChange, excludeChildrenNodeId,
  } = props

  const treeSelectRef = React.useRef(null)
  const [treeSelectOpen, setTreeSelectOpen] = React.useState(false)

  React.useEffect(() => {
    if (!visible) return
    setTimeout(() => {
      setTreeSelectOpen(true)
      treeSelectRef.current.focus()
    }, 400);
  }, [visible])

  const treeData = React.useMemo(() => {
    if (!visible) return []
    return formatBookmarkTreeNodes(dataSource, false, {
      excludeChildrenNodeId,
    })
  }, [dataSource, visible])

  return (
    <Modal
      open={visible}
      title={title}
      zIndex={baseZIndex}
      okText="确定"
      cancelText="取消"
      onOk={onOk}
      onCancel={onCancel}
    >
      <TreeSelect
        showSearch
        ref={treeSelectRef}
        open={treeSelectOpen}
        onDropdownVisibleChange={setTreeSelectOpen}
        style={{ width: "100%" }}
        treeData={treeData}
        value={value}
        onChange={onChange}
        treeNodeFilterProp="originalTitle"
        treeDefaultExpandedKeys={["1", "2"]}
      />
    </Modal>
  )
}

export default HandlerBar
