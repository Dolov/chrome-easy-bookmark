import React from 'react'

export interface SearchProps {
  data: any[]
}

const Search: React.FC<SearchProps> = props => {
  const { data } = props
  if (data.length === 0) return null
  return (
    <div className="search-list-container">
      {data.map(item => {
        const { originalTitle, url } = item
        return (
          <div>
            <a href={url} target="_blank">{originalTitle}</a>
          </div>
        )
      })}
    </div>
  )
}

export default Search
