import React from 'react'
import { fs } from '../../utils'

export interface SearchTextProps {
  text: string
  searchValue: string
  className?: string
}

const SearchText: React.FC<SearchTextProps> = props => {
  const { text, searchValue, className } = props
  const sText = fs(text)
  const sValue = fs(searchValue)
  const index = sText.indexOf(sValue);
  const beforeStr = sText.substring(0, index);
  const afterStr = sText.slice(index + sValue.length);
  if (index < 0) {
    return sText
  }
  return (
    <span className={className}>
      {beforeStr}
      <span className="text-red-600 font-bold">{sValue}</span>
      {afterStr}
    </span>
  )
}

export default SearchText
