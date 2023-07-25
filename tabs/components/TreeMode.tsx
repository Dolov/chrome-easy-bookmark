
import React from 'react'
import { debounce } from 'lodash'
import type { TreeProps } from 'antd'
import Tree from 'antd/es/tree'
import { moveBookMark } from '../../utils'

export interface TreeModeProps {
  data: TreeProps["treeData"]
  refresh(): void
  height?: number
  updateHeight?: boolean
}

const TreeMode: React.FC<TreeModeProps> = props => {
  const { data, height: outHeight, refresh, updateHeight } = props
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [height, setHeight] = React.useState(0)

  const calcHeight = () => {
    if (!containerRef.current) return
    const top = containerRef.current.offsetTop
    if (outHeight) {
      setHeight(outHeight - top - 65)
      return
    }
    setHeight(innerHeight - top - 24)
  }

  const calcHeightDebounce = debounce(calcHeight, 1000)

  React.useEffect(() => {
    calcHeight()
  }, [outHeight, updateHeight])

  const getElement = React.useCallback(element => {
    if (!element) return
    containerRef.current = element
    calcHeight()
  }, [])

  React.useEffect(() => {
    window.addEventListener('resize', calcHeightDebounce)
    return () => {
      window.removeEventListener('resize', calcHeightDebounce)
    }
  }, [])

  if (data.length === 0) return null

  const onDrop: TreeProps['onDrop'] = async info => {
    const { dragNode, node, dropPosition, dropToGap  } = info
    const position = dropPosition < 0 ? 0: dropPosition

    // 同级拖拽到第一个时的场景
    if (!dropToGap && position === 0) {
      await moveBookMark(dragNode, node.id, position)
      refresh()
      return
    }

    // 跨级拖拽至第一个
    if (!dropToGap && position === node.index && !node.url) {
      await moveBookMark(dragNode, node.id, 0)
      refresh()
      return
    }

    if (dropToGap) {
      await moveBookMark(dragNode, node.parentId, position)
      refresh()
      return
    }

    // if (node.url) {
    //   const newDir = await createBookMarkDir("未命名文件夹", node.parentId, position)
    //   await moveBookMark(node, newDir.id, 0)
    //   await moveBookMark(dragNode, newDir.id, 1)
    //   refresh()
    //   return
    // }
  };

  return (
    <div ref={getElement} className="tree-mode-container">
      {/* 如果高度为 0 或者为 undefined 会有性能问题，卡顿 */}
      {!!height && (
        <Tree
          multiple
          showIcon
          draggable
          blockNode
          defaultExpandAll
          height={height}
          onDrop={onDrop}
          treeData={data}
        />
      )}
    </div>
  )
}

export default TreeMode
