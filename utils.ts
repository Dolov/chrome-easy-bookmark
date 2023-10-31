import { orderBy } from 'lodash'

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

/** 获取目录结构书，方便展示 */
export const getDirTreeData = (treeData) => {
  return treeData.reduce((currentValue, item) => {
    if (!item) return currentValue
    const { children, url, id } = item
    if (url) return currentValue
    currentValue.push({
      ...item,
      key: id,
      children: getDirTreeData(children),
      // originalChildren: children,
    })
    return currentValue
  }, [])
}

export const assignTreeItemKey = treeData => {
  if (!Array.isArray(treeData)) return []
  return treeData.reduce((currentValue, item) => {
    if (!item) return currentValue
    const { id, children } = item
    currentValue.push({
      ...item,
      key: id,
      children: assignTreeItemKey(children),
    })
    return currentValue
  }, [])
}

/** 树结构编排化 */
export const flat = treeData => {
  if (!Array.isArray(treeData)) return []
  return treeData.reduce((currentValue, itemValue) => {
    const { children, ...otherProps } = itemValue
    return currentValue.concat([otherProps]).concat(flat(children))
  }, [])
}

/** 获取树结构中的某项 */
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

/** 根据 title 获取查询数据 */
export const searchTreeData = (searchValue, treeData) => {
  if (!Array.isArray(treeData)) return []
  const sValue = fs(searchValue)
  /** 展开后过滤符合条件的数据 */
  const data = flat(treeData).filter(item => {
    const sTitle = fs(item.originalTitle)
    return sTitle.includes(sValue)
  })
  /** 将文件夹放在顶部排序 */
  const orderData = orderBy(data, obj => obj.hasOwnProperty('url'), ['asce']);
  /** 获取并赋值文件夹内容 */
  orderData.forEach(item => {
    const { id, url } = item
    if (url) return
    const target = getOption(id, treeData)
    item.children = target.children.filter(item => item.url)
  })
  return orderData
}

/** 搜索匹配的文件夹 */
export const searchMatchDir = (searchValue, treeData) => {
  if (!Array.isArray(treeData)) return []
  const lowerValue = fs(searchValue)
  return flat(treeData).filter(item => {
    if (item.url) return false
    return fs(item.title).includes(lowerValue)
  })
}

/** 根据 id 递归查询上级 id */
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

/** 处理字符串 */
export const fs = (str: string) => {
  if (typeof str !== 'string') return ''
  return str.replace(/\s*/g, "").toLowerCase()
}

/** 命名空间 */
export enum Namespace {
  // 配置项
  SETTINGS = "settings",
  // 访问记录
  HISTORY = "history",
  // 历史模块的颜色
  HISTORY_COLOR = "history_color",
  // 搜索结果模块的颜色
  SEARCH_COLOR = "search_color",
  // 批量操作模块的颜色
  BATCH_ACTIONS_COLOR = "batch_actions_color",
}

/** 获取浏览器位于窗口的位置信息 */
const getCurrentPosition = (): Promise<chrome.windows.Window> => {
  return new Promise(resolve => {
    chrome.windows.getCurrent({ populate: true }, window => {
      resolve(window)
    });
  })
}

/** 在当前页面的中心位置打开新页面 */
export const openPage = async (url, options) => {
  const window = await getCurrentPosition()
  const { width, height, left, top } = window
  const pWidth = options.width
  const pHeight = options.height
  /** 打开重新选择标签存储位置的页面 */
  return await chrome.windows.create({
    url,
    type: "popup",
    width: pWidth,
    height: options.height,
    top: Math.floor(height / 2) + top - Math.floor(pHeight / 2),
    left: Math.floor(width / 2) + left - Math.floor(pWidth / 2),
  });
}

export const initialSettings = {
  showType: "window",
  width: 1000,
  height: 700,
  history: true,
}