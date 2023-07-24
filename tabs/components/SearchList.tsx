import React from 'react'
import List from 'antd/es/list'
import Empty from 'antd/es/empty'
import Collapse from 'antd/es/collapse'
import CaretRightOutlined from '@ant-design/icons/CaretRightOutlined'
import BackgroundContainer from './BackgroundContainer'
import { Namespace } from '../../utils'
import SearchText from './SearchText'
import Icon from './Icon'

export interface SearchProps {
  data: any[]
  searchValue: string
}

const DirItem: React.FC<{
  data: any[]
  title: string
  searchValue: string
}> = props => {
  const { data, title, searchValue } = props

  const header = (
    <span className="flex items-center">
      <Icon className="flex items-center" name="dir" size={20} />
      <SearchText
        text={title}
        searchValue={searchValue}
        className="ml-1"
      />
    </span>  
  )
  return (
    <Collapse
      bordered={false}
      expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
    >
      <Collapse.Panel key={title} header={header}>
        <List
          itemLayout="horizontal"
          dataSource={data}
          renderItem={(item, index) => {
            const { originalTitle, id, parentChain, url } = item
            const parentDirs = parentChain.map(item => item.title)
            const description = <UrlItem title={originalTitle} searchValue={searchValue} url={url}  />

            return (
              <List.Item key={id}>
                <List.Item.Meta
                  className="px-4"
                  title={url && parentDirs.join(" / ")}
                  description={description}
                />
              </List.Item>
            )
          }}
        />
      </Collapse.Panel>
    </Collapse>
  )
}

const UrlItem: React.FC<{
  url: string
  title: string
  searchValue: string
}> = props => {
  const { url, title, searchValue } = props
  return (
    <a className="hover:underline" target="_blank" href={url}>
      <SearchText
        text={title}
        searchValue={searchValue}
      />
    </a>  
  )
}

const Search: React.FC<SearchProps> = props => {
  const { data, searchValue } = props
  if (data.length === 0) {
    return (
      <Empty
        className="mt-14"
        imageStyle={{ height: 200 }}
        description={false}
      />  
    )
  }
  return (
    <BackgroundContainer
      className="search-list-container flex-1 overflow-auto"
      strore_key={Namespace.SEARCH_COLOR}
    >
      <List
        itemLayout="horizontal"
        dataSource={data}
        renderItem={(item, index) => {
          const { originalTitle, id, parentChain, url, children } = item
          const parentDirs = parentChain.map(item => item.title)
          const description = url ? 
            <UrlItem title={originalTitle} searchValue={searchValue} url={url}  />:
            <DirItem title={originalTitle} searchValue={searchValue} data={children} />

          return (
            <List.Item key={id}>
              <List.Item.Meta
                className="px-4"
                title={url && parentDirs.join(" / ")}
                description={description}
              />
            </List.Item>
          )
        }}
      />
    </BackgroundContainer>
  )
}

export default Search
