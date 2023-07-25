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
  onLinkClick(item: any): void
  onDirNameClick(item: any): void
}

const DirItem: React.FC<{
  data: any[]
  title: string
  onLinkClick(item: any): void
  parentChain: any[]
  searchValue: string
}> = props => {
  const { data, title, onLinkClick, searchValue, parentChain } = props

  let searchText = title
  if (Array.isArray(parentChain) && parentChain.length) {
    searchText = parentChain.map(item => item.title).join(' / ') + " / " + searchText
  }

  const header = (
    <span className="flex items-center">
      <Icon className="flex items-center" name="dir" size={20} />
      <SearchText
        text={searchText}
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
            const { originalTitle, id, url } = item
            const description = (
              <UrlItem
                url={url}
                title={originalTitle}
                onLinkClick={onLinkClick}
                searchValue={searchValue}
              />  
            )

            return (
              <List.Item key={id}>
                <List.Item.Meta
                  className="px-4"
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
  onLinkClick(item: any): void
  searchValue: string
}> = props => {
  const { url, onLinkClick, title, searchValue } = props
  return (
    <a onClick={onLinkClick} className="hover:underline" target="_blank" href={url}>
      <SearchText
        text={title}
        searchValue={searchValue}
      />
    </a>  
  )
}

const Search: React.FC<SearchProps> = props => {
  const { data, searchValue, onLinkClick, onDirNameClick } = props
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
      className="flex-1 overflow-auto"
      strore_key={Namespace.SEARCH_COLOR}
    >
      <List
        itemLayout="horizontal"
        dataSource={data}
        renderItem={(item, index) => {
          const { originalTitle, id, parentChain, url, children } = item

          if (!url && children.length === 0) return null

          const description = url ?
            <UrlItem
              url={url}
              title={originalTitle}
              onLinkClick={() => onLinkClick(item)}
              searchValue={searchValue}
            />:
            <DirItem
              data={children}
              title={originalTitle}
              onLinkClick={() => onLinkClick(item)}
              searchValue={searchValue}
              parentChain={parentChain}
            />

          const title = url && (
            parentChain.map((item, index) => {
              const separator = index < parentChain.length - 1 ? " / ": ""
              return (
                <>
                  <span
                    key={item.id}
                    // onClick={() => onDirNameClick(item)}
                    // className="hover:underline cursor-pointer"
                  >
                    {item.title}
                  </span>
                  {separator}
                </>
              )
            })
          )

          return (
            <List.Item key={id}>
              <List.Item.Meta
                title={title}
                className="px-4"
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
