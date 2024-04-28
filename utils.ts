import React from "react"

export const useBoolean = (defaultValue = false) => {
  const [value, setValue] = React.useState(defaultValue)
  const valueRef = React.useRef<boolean>()
  valueRef.current = value
  const toggle = () => {
    valueRef.current = !valueRef.current
    setValue(valueRef.current)
  }
  return [value, toggle, valueRef] as const
}


export enum MessageActionEnum {
  COMMAND = "COMMAND",
  BOOKMARK_GET_TREE = "BOOKMARK_GET_TREE",
  BOOKMARK_CREATE = "BOOKMARK_CREATE",
  BOOKMARK_UPDATE = "BOOKMARK_UPDATE",
  BOOKMARK_MOVE = "BOOKMARK_MOVE",
  BOOKMARK_DELETE = "BOOKMARK_DELETE",
  ACTION_ON_CLICKED = "ACTION_ON_CLICKED",
}

export const formatBookmarkTreeNodes = (treeData, withLeaf = false) => {
  return treeData.reduce((currentValue, item) => {
    if (!item) return currentValue
    const { children = [], url, id, title } = item
    if (!withLeaf && url) return currentValue
    currentValue.push({
      ...item,
      key: id,
      value: id,
      label: title,
      children: formatBookmarkTreeNodes(children, withLeaf),
      isLeaf: !!url
    })
    return currentValue
  }, [])
}

export const findTreeNode = (url: string, treeData: chrome.bookmarks.BookmarkTreeNode[]): 
chrome.bookmarks.BookmarkTreeNode | undefined => {
  if (!treeData || !treeData.length) return
  for (let index = 0; index < treeData.length; index++) {
    const item = treeData[index];
    if (item.url === url) return item
    const target = findTreeNode(url, item.children)
    if (target) return target
  }
}