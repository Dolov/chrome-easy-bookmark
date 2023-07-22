import React from 'react'
import List from 'antd/es/list'
import Empty from 'antd/es/empty'
import BackgroundContainer from './BackgroundContainer'
import { Namespace } from '../../utils'

export interface SearchProps {
  data: any[]
}

const Search: React.FC<SearchProps> = props => {
  const { data } = props
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
      className="search-list-container"
      strore_key={Namespace.SEARCH_COLOR}
    >
      <List
        itemLayout="horizontal"
        dataSource={data}
        renderItem={(item, index) => {
          console.log('item: ', item);
          const { originalTitle, id, parentChain, url } = item
          const parentDirs = parentChain.map(item => item.title)
          return (
            <List.Item key={id}>
              <List.Item.Meta
                className="px-4"
                title={parentDirs.join(" / ")}
                description={(
                  <a className="hover:underline" target="_blank" href={url}>{originalTitle}</a>  
                )}
              />
            </List.Item>
          )
        }}
      />
    </BackgroundContainer>
  )
}

export default Search
