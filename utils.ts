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
  GET_BOOKMARK_TREE = "GET_BOOKMARK_TREE",
  CREATE_BOOKMARK = "CREATE_BOOKMARK",
  UPDATE_BOOKMARK = "UPDATE_BOOKMARK",
  MOVE_BOOKMARK = "MOVE_BOOKMARK",
  DELETE_BOOKMARK = "DELETE_BOOKMARK",
}

export const formatBookmarkTreeNodes = (treeData) => {
  return treeData.reduce((currentValue, item) => {
    if (!item) return currentValue
    const { children, url, id, title } = item
    if (url) return currentValue
    currentValue.push({
      ...item,
      key: id,
      value: id,
      label: title,
      children: formatBookmarkTreeNodes(children),
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