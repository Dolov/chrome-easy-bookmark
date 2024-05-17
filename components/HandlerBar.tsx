import React from 'react'
import { Button, Tooltip, message } from 'antd'
import { ChromeFilled } from '@ant-design/icons'
import {
  type TreeNodeProps, getBookmarksToText,
  copyTextToClipboard, MessageActionEnum
} from '~utils'
import {
  MaterialSymbolsDelete, MaterialSymbolsDriveFileMoveRounded,
  RiDownloadCloud2Fill, MaterialSymbolsContentCopyRounded
} from '~components/Icon'

export interface HandlerBarProps {
  onSuccess(): void
  dataSource: TreeNodeProps[]
  checkedKeys: string[]
}

const getBookmarkList = (checkedKeys: string[], dataSource: TreeNodeProps[]) => {
  return dataSource.reduce((bookmarks, item) => {
    const { id, children } = item
    if (checkedKeys.includes(item.id)) {
      bookmarks.push(item)
    }
    if (item.children) {
      // @ts-ignore
      bookmarks = bookmarks.concat(getBookmarkList(checkedKeys, children))
    }
    return bookmarks
  }, [])
}

const HandlerBar: React.FC<HandlerBarProps> = props => {
  const { checkedKeys, dataSource, onSuccess } = props
  const visible = checkedKeys.length > 0

  const bookmarks = React.useMemo(() => {
    if (!checkedKeys) return []
    if (!checkedKeys.length) return []
    return getBookmarkList(checkedKeys, dataSource)
  }, [checkedKeys, dataSource])

  const handleOpen = () => {
    bookmarks.forEach(item => {
      const { url } = item
      if (url) window.open(url)
    })
  }

  const handleMove = () => {

  }

  const handleCopy = () => {
    const text = getBookmarksToText(bookmarks)
    copyTextToClipboard(text)
    message.success("复制成功。")
  } 
  const handleDelete = async () => {
    for (let index = 0; index < bookmarks.length; index++) {
      const element = bookmarks[index];
      const { url, id } = element
      const action = url ? MessageActionEnum.BOOKMARK_REMOVE : MessageActionEnum.BOOKMARK_REMOVE_TREE
      await chrome.runtime.sendMessage({
        id,
        action,
      })
    }
    message.success("删除成功。")
    onSuccess()
  }

  const handleDownload = () => {

  }

  return (
    <div className="mb-2 min-h-[1]">
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
              <Button onClick={handleMove} className="center" type="text" shape="circle">
                <MaterialSymbolsDriveFileMoveRounded className="text-lg text-gray-700" />
              </Button>
            </Tooltip>
            <Tooltip title="下载选中书签">
              <Button onClick={handleDownload} className="center" type="text" shape="circle">
                <RiDownloadCloud2Fill className="text-lg text-gray-700" />
              </Button>
            </Tooltip>
            <Tooltip title="删除选中书签">
              <Button onClick={handleDelete} className="center" type="text" shape="circle">
                <MaterialSymbolsDelete className="text-lg text-red-500" />
              </Button>
            </Tooltip>
          </div>
        </div>
      )}
    </div>
  )
}

export default HandlerBar
