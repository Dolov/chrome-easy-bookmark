import React from 'react'
import { useStorage } from '@plasmohq/storage/hook'
import { debounce } from 'lodash'
import Input from 'antd/es/input'
import classnames from 'classnames'
import SearchOutlined from '@ant-design/icons/SearchOutlined'
import Icon from '../components/Icon'
import History from '../components/History'
import TreeMode from '../components/TreeMode'
import TreeTitle from '../components/TreeTitle'
import SearchList from '../components/SearchList'
import BatchActions from '../components/BatchActions'
import { getBookmarks, mergeRootDir, searchTreeData, Namespace } from '../../utils'
import './ManagerCore.less'

export interface ManagerCoreProps {
  height?: number
  historyVisible?: boolean
}

const ManagerCore: React.FC<ManagerCoreProps> = props => {
  const { height, historyVisible = true } = props

  const [selectedKeys, onSelectedKeysChange] = React.useState([])

  /**
   * 频繁的操作会导致报错
   * MAX_WRITE_OPERATIONS_PER_MINUTE
   */
  const [history = [], setHistroy] = useStorage(Namespace.HISTORY)
  const [searchValue, setSearchValue] = React.useState("")
  const [bookmarks, setBookmarks] = React.useState<any>([])
  const [searchList, setSearchList] = React.useState([])
  const histroyRef = React.useRef(history)
  histroyRef.current = history

  /** 记录点击过的菜单 */
  const handleLinkClick = item => {
    histroyRef.current = [
      {
        ...item,
        time: new Date().getTime(),
      },
      ...histroyRef.current
    ]
    setHistroy(histroyRef.current)
  }

  const handleDirNameClick = item => {
    setSearchValue("")
  }

  const init = async () => {
    const books = await getBookmarks()
    const data = mergeRootDir(books)
    const formatTreeData = (treeData, parentChain) => {
      if (!Array.isArray(treeData)) return []
      return treeData.map(item => {
        const nextParentChain = [...parentChain, { id: item.id, title: item.title }]
        return {
          ...item,
          parentChain,
          key: item.id,
          icon: item.url ? null : <Icon name="dir" size={20} />,
          title: (
            <TreeTitle item={item} onClick={handleLinkClick} refresh={init} />
          ),
          originalTitle: item.title || "",
          children: formatTreeData(item.children, nextParentChain)
        }
      })
    }
    const treeData = formatTreeData(data, [])
    setBookmarks(treeData)
  }

  React.useEffect(() => {
    init()
  }, [])

  /** 搜索 */
  const handleChange = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchValue(value)
    if (!value) {
      setSearchList([])
      return
    }
    const data = searchTreeData(value, bookmarks)
    setSearchList(data)
  }, 300)

  const searchListVisible = !!searchValue

  return (
    <div className='manager-page-container flex-1 flex flex-col overflow-hidden'>
      <header>
        <Input
          autoFocus
          prefix={<SearchOutlined />}
          onChange={handleChange}
          className="h-[40px] rounded-[20px]"
        />
      </header>
      <main className="mt-6 flex flex-1 flex-col overflow-hidden">
        {historyVisible && <History data={history} />}
        {!searchListVisible && (
          <BatchActions selectedKeys={selectedKeys} />  
        )}
        {searchListVisible && (
          <SearchList
            data={searchList}
            searchValue={searchValue}
            onLinkClick={handleLinkClick}
            onDirNameClick={handleDirNameClick}
          />
        )}
        <div className={classnames({
          "hidden": searchListVisible,
        })}>
          <TreeMode
            data={bookmarks}
            height={height}
            refresh={init}
            onSelect={onSelectedKeysChange}
            selectedKeys={selectedKeys}
            updateHeight={historyVisible}
          />
        </div>
      </main>
    </div>
  )
}

export default ManagerCore
