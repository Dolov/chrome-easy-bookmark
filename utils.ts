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

export const baseZIndex = 2000

export enum MessageActionEnum {
  COMMAND = "COMMAND",
  BOOKMARK_MOVE = "BOOKMARK_MOVE",
  BOOKMARK_CREATE = "BOOKMARK_CREATE",
  BOOKMARK_UPDATE = "BOOKMARK_UPDATE",
  BOOKMARK_REMOVE = "BOOKMARK_REMOVE",
  BOOKMARK_GET_TREE = "BOOKMARK_GET_TREE",
  BOOKMARK_REMOVE_TREE = "BOOKMARK_REMOVE_TREE",
  ACTION_ON_CLICKED = "ACTION_ON_CLICKED",
}

export enum StorageKeyEnum {
  SEARCH_TYPE = "SEARCH_TYPE",
  CASE_SENSITIVE = "CASE_SENSITIVE"
}

export enum SearchTypeEnum {
  URL = "URL",
  DIR = "DIR",
  MIXIN = "MIXIN",
}

export const searchTypeState = {
  [SearchTypeEnum.URL]: {
    next() {
      return SearchTypeEnum.DIR
    }
  },
  [SearchTypeEnum.DIR]: {
    next() {
      return SearchTypeEnum.MIXIN
    }
  },
  [SearchTypeEnum.MIXIN]: {
    next() {
      return SearchTypeEnum.URL
    }
  }
}


export const formatBookmarkTreeNodes = (treeData = [], withLeaf = false) => {
  return treeData.reduce((currentValue, item) => {
    if (!item) return currentValue
    const { children = [], url, id, title } = item
    if (!withLeaf && url) return currentValue
    currentValue.push({
      ...item,
      key: id,
      value: id,
      originalTitle: title,
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

export const removeEmptyNode = (treeData = []) => {
  return treeData.reduce((currentValue, item) => {
    if (!item) return currentValue
    const { children = [], url } = item
    if (url) {
      currentValue.push(item)
      return currentValue
    }
    if (children.length) {
      const nodes = removeEmptyNode(children)
      if (nodes) {
        currentValue.push({
          ...item,
          children: nodes
        })
      }
    }
    return currentValue
  }, [])
}