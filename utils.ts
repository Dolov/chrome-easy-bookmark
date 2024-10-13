import { type TreeDataNode } from "antd"

export const baseZIndex = 2000

export const serverUrl = "https://easy-bookmark-server.freeless.cn"

export type TreeNodeProps = TreeDataNode &
  chrome.bookmarks.BookmarkTreeNode & {
    originalTitle: string
    children: TreeNodeProps[]
  }

export enum MessageActionEnum {
  COMMAND = "COMMAND",
  BOOKMARK_MOVE = "BOOKMARK_MOVE",
  BOOKMARK_CREATE = "BOOKMARK_CREATE",
  BOOKMARK_UPDATE = "BOOKMARK_UPDATE",
  BOOKMARK_REMOVE = "BOOKMARK_REMOVE",
  BOOKMARK_GET_TREE = "BOOKMARK_GET_TREE",
  BOOKMARK_REMOVE_TREE = "BOOKMARK_REMOVE_TREE",
  ACTION_ON_CLICKED = "ACTION_ON_CLICKED",
  /** 打开书签广场 */
  OPEN_SQUARE = "OPEN_SQUARE"
}

export enum StorageKeyEnum {
  UNION = "UNION",
  SEARCH_TYPE = "SEARCH_TYPE",
  LAST_PARENT_ID = "LAST_PARENT_ID",
  CASE_SENSITIVE = "CASE_SENSITIVE"
}

export enum SearchTypeEnum {
  URL = "URL",
  DIR = "DIR",
  MIXIN = "MIXIN"
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

export const formatBookmarkTreeNodes = (
  treeData = [],
  withLeaf = false,
  options?
) => {
  const { excludeChildrenNodeId } = options || {}
  return treeData.reduce((currentValue, item) => {
    if (!item) return currentValue
    const { children = [], url, id, title } = item
    if (!withLeaf && url) return currentValue

    const pushItem = {
      ...item,
      key: id,
      value: id,
      isLeaf: !!url,
      originalTitle: title
    }

    if (excludeChildrenNodeId === id) {
      pushItem.isLeaf = true
      pushItem.children = []
    } else {
      pushItem.children = formatBookmarkTreeNodes(children, withLeaf, options)
      const isLeaf = !pushItem.children.length
      pushItem.isLeaf = isLeaf
    }

    currentValue.push(pushItem)
    return currentValue
  }, [])
}

export const findBookmarkByUrl = (
  url: string,
  treeData: chrome.bookmarks.BookmarkTreeNode[]
): chrome.bookmarks.BookmarkTreeNode | undefined => {
  if (!treeData || !treeData.length) return
  for (let index = 0; index < treeData.length; index++) {
    const item = treeData[index]
    if (item.url === url) return item
    const target = findBookmarkByUrl(url, item.children)
    if (target) return target
  }
}

export const getBookmarksToText = (children: TreeNodeProps[]) => {
  return children.reduce((text, item) => {
    const { url, originalTitle } = item
    if (url) {
      return `${text}\n\n${originalTitle}\n${url}`
    }
    const childrenText = getBookmarksToText(item.children as unknown as any)
    return `${text}\n\n${childrenText}`
  }, "")
}

const getBookmarkAsHtml = (
  children: TreeNodeProps[],
  parentTitle = "",
  level = 1
) => {
  const n = level > 6 ? 6 : level
  let html = `<h${n}>${parentTitle}</h${n}><ul>\n`

  children.forEach((child) => {
    if (child.url) {
      html += `<li><a href="${child.url}" target="_blank">${child.originalTitle}</a></li>\n`
      return
    }

    if (child.children) {
      html += getBookmarkAsHtml(child.children, child.originalTitle, level + 1)
    }
  })
  html += `</ul>\n`
  return html
}

export const downloadBookmarkAsHtml = (
  children: TreeNodeProps[],
  title = "书签"
) => {
  const downloadLink = document.createElement("a")
  const html = getBookmarkAsHtml(children)
  downloadLink.setAttribute(
    "href",
    "data:text/html;charset=utf-8," + encodeURIComponent(html)
  )
  downloadLink.setAttribute("download", `${title}.html`)
  downloadLink.click()
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

export function highlightText(
  inputText: string,
  keywords: string[],
  sensitive = false
) {
  const i = sensitive ? "" : "i"
  // 创建正则表达式匹配所有关键字
  const regex = new RegExp(keywords.join("|"), `g${i}`)
  let index = 0
  // 在文本中匹配关键字并进行高亮
  return inputText.replace(regex, (substring, ...args) => {
    index += 1
    return `<span class="highlight highlight-${index}">${substring}</span>`
  })
}

/**
 * Copies the given text to the clipboard.
 *
 * @param {string} text - The text to be copied.
 * @return {void} This function does not return anything.
 */
export const copyTextToClipboard = (text: string) => {
  const textArea = document.createElement("textarea")
  textArea.value = text
  document.body.appendChild(textArea)
  textArea.select()

  try {
    const successful = document.execCommand("copy")
  } catch (err) {
    console.log("err: ", err)
  }
  document.body.removeChild(textArea)
}
