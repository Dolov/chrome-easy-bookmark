import React from 'react'
import { Input } from 'antd'
import { debounce } from 'lodash'
import { SearchOutlined } from '@ant-design/icons'
import History from '../components/History'
import TreeMode from '../components/TreeMode'
import SearchList from '../components/SearchList'
import { useStorage } from '@plasmohq/storage/hook'
import { getBookmarks, mergeRootDir, formatTreeData, searchTreeData } from '../utils'
import './manager.less'

const HISTORY_DATA_KEY = 'history'

export interface managerProps {

}

const manager: React.FC<managerProps> = props => {
  const { } = props

  const [history = [], setHistroy] = useStorage(HISTORY_DATA_KEY)
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
    <div className='container'>
      <header>
        <Input
          autoFocus
          prefix={<SearchOutlined />}
          className="search-input"
          onChange={handleChange}
        />
      </header>
      <main>
        <History data={histroyRef.current} />
        <SearchList data={searchList} />
        <div className='list-container'>
          <TreeMode
            data={bookmarks}
            refresh={init}
          />
        </div>
      </main>
    </div>
  )
}

export default manager
