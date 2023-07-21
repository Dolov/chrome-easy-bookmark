import React from 'react'
import Icon from './components/Icon'
import TreeTitle from './components/TreeTitle'

/** 获取书签数据 */
export const getBookmarks = () => {
  return new Promise(resolve => {
    chrome.bookmarks.getTree(bookmarkTreeNodes => {
      resolve(bookmarkTreeNodes)
    });
  })
}

/** 移动书签位置 */
export const moveBookMark = (bookmark, parentId, index) => {
  return new Promise(resolve => {
    chrome.bookmarks.move(bookmark.id, {
      index,
      parentId,
    }, movedBookmark => {
      resolve(movedBookmark)
    });
  })
}

/** 更新书签信息 */
export const updateBookMark = bookmark => {
  return new Promise(resolve => {
    chrome.bookmarks.update(bookmark.id, {
      url: bookmark.url,
      title: bookmark.title,
    }, updatedBookmark => {
      resolve(updatedBookmark)
    });
  })
}

/** 更新书签信息并移动 */
export const updateMoveBookMark = async (bookmark, parentId, index) => {
  const updatedBookmark = await updateBookMark(bookmark)
  const newBookmark = await moveBookMark(updatedBookmark, parentId, index)
  return newBookmark
}

/** 删除书签 */
export const deleteBookMark = async id => {
  return new Promise(resolve => {
    chrome.bookmarks.remove(id, () => {
      resolve(true)
    });
  })
}

/** 创建文件夹 */
export const createBookMarkDir = (title: string, parentId, index) => {
  return new Promise(resolve => {
    chrome.bookmarks.create({ title, parentId, index }, newFolder => {
      resolve(newFolder)
    });
  })
}


export const formatTreeData = (treeData, parentChain, options?) => {
  if (!Array.isArray(treeData)) return []
  const { onClick = () => { }, jsxTitle = true } = options || {}
  return treeData.map(item => {
    const nextParentChain = [...parentChain, { id: item.id, title: item.title }]
    return {
      ...item,
      parentChain,
      key: item.id,
      icon: item.url ? null : <Icon name="dir" size={20} />,
      title: jsxTitle ? (
        <TreeTitle item={item} onClick={onClick} />
      ) : item.title,
      originalTitle: item.title || "",
      children: formatTreeData(item.children, nextParentChain, options)
    }
  })
}

export const getDirTreeData = (treeData) => {
  return treeData.reduce((currentValue, item) => {
    if (!item) return currentValue
    const { children, url, id } = item
    if (url) return currentValue
    currentValue.push({
      ...item,
      key: id,
      children: getDirTreeData(children),
      originalChildren: children,
    })
    return currentValue
  }, [])
}

export const flat = treeData => {
  if (!Array.isArray(treeData)) return []
  return treeData.reduce((currentValue, itemValue) => {
    const { children, ...otherProps } = itemValue
    return currentValue.concat([otherProps]).concat(flat(children))
  }, [])
}

export const getOption = (id, treeData) => {
  if (!Array.isArray(treeData)) return null
  for (let index = 0; index < treeData.length; index++) {
    const item = treeData[index];
    const { children } = item
    if (id === item.id) return item
    const target = getOption(id, children)
    if (target) return target
  }
}

export const searchTreeData = (searchValue, treeData) => {
  if (!Array.isArray(treeData)) return []
  const lowerValue = searchValue.toLowerCase().replace(/\s/g, "")
  return flat(treeData).filter(item => {
    if (!item.url) return false
    return item.originalTitle.toLowerCase().replace(/\s/g, "").includes(lowerValue)
  })
}

/** 搜索匹配的文件夹 */
export const searchMatchDir = (searchValue, treeData) => {
  if (!Array.isArray(treeData)) return []
  const lowerValue = searchValue.toLowerCase().replace(/\s/g, "")
  return flat(treeData).filter(item => {
    if (item.url) return false
    return item.title.toLowerCase().replace(/\s/g, "").includes(lowerValue)
  })
}

export const getParentIds = (key, treeData) => {
  const ids = []
  const target = getOption(key, treeData)
  if (!target?.parentId) return ids
  const { parentId } = target
  ids.push(parentId)
  const nextIds = getParentIds(parentId, treeData)
  ids.push(...nextIds)
  return ids
}

/** 将“书签栏”与“其他书签”合并 */
export const mergeRootDir = treeData => {
  if (!Array.isArray(treeData)) return []
  const rootData = treeData?.[0]?.children || []
  if (rootData.length === 2) {
    const [root1, root2] = rootData
    return root1.children.concat([root2])
  }
  return rootData
}


export const fs = (str: string) => {
  if (typeof str !== 'string') return ''
  return str.replace(/\s*/g, "").toLowerCase()
}