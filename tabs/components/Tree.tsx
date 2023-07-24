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
    if (!value) return
    // const keys = searchMatchDir(value, treeData).map(item => item.key)

    const items = searchMatchDir(value, treeData)
    const keys = items.reduce((currentValue, item) => {
      const ids = getParentIds(item.key, treeData)
      return currentValue.concat(ids)
    }, [])
    const expandedKeys = Array.from(new Set(keys))
    setExpandedKeys(expandedKeys)
  }, 150)

  const jsxTreeData = React.useMemo(() => {
    if (!searchValue) return treeData
    const loop = treeData => treeData.map(item => {
      const title = (
        <SearchText text={item.title} searchValue={searchValue} />
      )
      if (item.children) {
        return { title, key: item.key, children: loop(item.children) };
      }

      return {
        title,
        key: item.key,
      };
    });

    return loop(treeData)
  }, [searchValue, treeData])

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
