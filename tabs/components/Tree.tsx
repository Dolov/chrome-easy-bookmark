import React from 'react'
import { debounce } from 'lodash'
import SearchOutlined from '@ant-design/icons/SearchOutlined'
import type { TreeProps } from 'antd'
import Tree from 'antd/es/tree'
import Input from 'antd/es/input'
import { searchMatchDir, getParentIds, fs } from '../../utils'
import SearchText from './SearchText'

const SearchTree: React.FC<TreeProps> = props => {
  const { treeData, height = 385, selectedKeys, onSelect } = props
  const [expandedKeys, setExpandedKeys] = React.useState([])
  const [searchValue, setSearchValue] = React.useState("")

  React.useEffect(() => {
    if (!treeData.length) return
    const defaultKey = treeData[0]?.key
    if (defaultKey) {
      onSelect([defaultKey], null)
    }
    const keys = treeData.map(item => item.key)
    setExpandedKeys(keys)
  }, [treeData])

  const onSearchInputChange = debounce(e => {
    const { value } = e.target;
    setSearchValue(value)
  }, 150)

  const jsxTreeData = React.useMemo(() => {
    if (!searchValue) return treeData
    const sValue = fs(searchValue)

    const loop = treeData => {
      if (!Array.isArray(treeData)) return []
      return treeData.reduce((previousValue, currentItem) => {
        const { title, children, key, url } = currentItem
        const sText = fs(title)
        const index = sText.indexOf(sValue);
        const match = index >= 0
        const jsxChildren = loop(children)

        if (!match && jsxChildren.length === 0) {
          return previousValue
        }

        let jsxTitle = match ? (
          <SearchText text={title} searchValue={searchValue} />
        ) : title

        previousValue.push({
          key,
          title: jsxTitle,
          children: jsxChildren,
        })

        return previousValue
      }, [])
    }

    return loop(treeData)
  }, [searchValue, treeData])

  React.useEffect(() => {
    if (!searchValue) return
    const getIds = treeData => {
      return treeData.reduce((currentValue, item) => {
        const { children, key, url } = item
        if (url) return currentValue
        currentValue.push(key)
        if (Array.isArray(children)) {
          const ids = getIds(children)
          currentValue.push(...ids)
        }
        return currentValue
      }, [])
    }

    const ids = getIds(jsxTreeData)
    const expandedKeys = Array.from(new Set(ids))
    setExpandedKeys(expandedKeys)
  }, [jsxTreeData])

  const onExpand = keys => {
    setExpandedKeys(keys)
  }

  return (
    <div className='searchable-tree'>
      <Input
        autoFocus
        prefix={<SearchOutlined />}
        onChange={onSearchInputChange}
      />
      <Tree
        height={height}
        onExpand={onExpand}
        treeData={jsxTreeData}
        onSelect={onSelect}
        selectedKeys={selectedKeys}
        expandedKeys={expandedKeys}
      />
    </div>
  )
}

export default SearchTree
