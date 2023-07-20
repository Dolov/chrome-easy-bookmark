import React from 'react'

export interface TreeTitleProps {
  item: any
  onClick(item): void
}

const TreeTitle: React.FC<TreeTitleProps> = props => {
  const { item, onClick } = props
  const { url, title } = item

  if (!url) {
    return (
      <span className='tree-title-dir-name'>{title}</span>  
    )
  }

  const handleClick = e => {
    onClick(item)
    e.stopPropagation()
  }

  return (
    <a
      href={url}
      target="_blank"
      className='tree-title-link'
      onClick={handleClick}
    >
      {title}
    </a>
  )
}

export default TreeTitle
