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

/** 创建文件夹 */
export const createBookMarkDir = (title: string, parentId, index) => {
  return new Promise(resolve => {
    chrome.bookmarks.create({ title, parentId, index }, newFolder => {
      resolve(newFolder)
   });
  })
}


export const formatTreeData = (treeData, parentChain, options) => {
  if (!Array.isArray(treeData)) return []
  const { onClick } = options
  return treeData.map(item => {
    const nextParentChain = [...parentChain, { id: item.id, title: item.title }]
    return {
      ...item,
      parentChain,
      key: item.id,
      icon: item.url ? null: <Icon name="dir" size={20} />,
      title: (
        <TreeTitle item={item} onClick={onClick} />  
      ),
      originalTitle: item.title || "",
      children: formatTreeData(item.children, nextParentChain, options)
    }
  })
}

export const flat = treeData => {
  if (!Array.isArray(treeData)) return []
  return treeData.reduce((currentValue, itemValue) => {
    const { children, ...otherProps } = itemValue
    return currentValue.concat([otherProps]).concat(flat(children))
  }, [])
}

export const searchTreeData = (searchValue, treeData) => {
  if (!Array.isArray(treeData)) return []
  const lowerValue = searchValue.toLowerCase().replace(/\s/g, "")
  return flat(treeData).filter(item => {
    if (!item.url) return false
    return item.originalTitle.toLowerCase().replace(/\s/g, "").includes(lowerValue)
  })
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