import React from 'react'
import { useStorage } from '@plasmohq/storage/hook'
import { debounce } from 'lodash'
import Input from 'antd/es/input'
import SearchOutlined from '@ant-design/icons/SearchOutlined'
import History from '../components/History'
import TreeMode from '../components/TreeMode'
import SearchList from '../components/SearchList'
import { getBookmarks, mergeRootDir, formatTreeData, searchTreeData, Namespace } from '../../utils'
import './ManagerCore.less'

export interface ManagerCoreProps {
  height?: number
  showHistory?: boolean
}

const ManagerCore: React.FC<ManagerCoreProps> = props => {
  const { height, showHistory = true } = props

  /**
   * 频繁的操作会导致报错
   * MAX_WRITE_OPERATIONS_PER_MINUTE
   */
  const [history = [], setHistroy] = useStorage(Namespace.HISTORY)

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
    if (!value) {
      setSearchList([])
      return
    }
    const data = searchTreeData(value, bookmarks)
    setSearchList(data)
  }, 1000)

  return (
    <div className='manager-page-container'>
      <header>
        <Input
          autoFocus
          prefix={<SearchOutlined />}
          className="search-input"
          onChange={handleChange}
        />
      </header>
      <main className="mt-6">
        {showHistory && <History data={history} />}
        <SearchList data={searchList} />
        <div className='list-container'>
          <TreeMode
            data={bookmarks}
            height={height}
            refresh={init}
            updateHeight={showHistory}
          />
        </div>
      </main>
    </div>
  )
}

export default ManagerCore
