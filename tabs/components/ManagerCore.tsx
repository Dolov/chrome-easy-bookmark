import React from 'react'
import { useStorage } from '@plasmohq/storage/hook'
import { debounce } from 'lodash'
import Input from 'antd/es/input'
import classnames from 'classnames'
import SearchOutlined from '@ant-design/icons/SearchOutlined'
import History from '../components/History'
import TreeMode from '../components/TreeMode'
import SearchList from '../components/SearchList'
import { getBookmarks, mergeRootDir, formatTreeData, searchTreeData, Namespace, fs } from '../../utils'
import './ManagerCore.less'

export interface ManagerCoreProps {
  height?: number
  historyVisible?: boolean
}

const ManagerCore: React.FC<ManagerCoreProps> = props => {
  const { height, historyVisible = true } = props

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

  const init = async () => {
    const books = await getBookmarks()
    const data = mergeRootDir(books)
    
    const treeData = formatTreeData(data, [], {
      onClick: handleLinkClick,
    })
    setBookmarks(treeData)
  }

  React.useEffect(() => {
    init()
  }, [])

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
    <div className='manager-page-container flex-1'>
      <header>
        <Input
          autoFocus
          prefix={<SearchOutlined />}
          className="search-input"
          onChange={handleChange}
        />
      </header>
      <main className="mt-6 flex flex-1 flex-col overflow-hidden">
        {historyVisible && <History data={history} />}
        {searchListVisible && (
          <SearchList
            data={searchList}
            searchValue={searchValue}
          />  
        )}
        <div className={classnames("list-container", {
          "hidden": searchListVisible,
        })}>
          <TreeMode
            data={bookmarks}
            height={height}
            refresh={init}
            updateHeight={historyVisible}
          />
        </div>
      </main>
    </div>
  )
}

export default ManagerCore
