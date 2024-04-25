import React from "react"

export const useBoolean = (defaultValue = false) => {
  const [value, setValue] = React.useState(defaultValue)
  const valueRef = React.useRef<boolean>()
  valueRef.current = value
  const toggle = () => {
    setValue(!valueRef.current)
  }
  return [value, setValue, toggle] as const
}


export enum MessageActionEnum {
  GET_BOOK_MARK_TREE = "GET_BOOK_MARK_TREE"
}

export const formatBookmarkTreeNodes = (treeData) => {
  return treeData.reduce((currentValue, item) => {
    if (!item) return currentValue
    const { children, url, id, title } = item
    if (url) return currentValue
    currentValue.push({
      ...item,
      key: id,
      label: title,
      children: formatBookmarkTreeNodes(children),
    })
    return currentValue
  }, [])
}