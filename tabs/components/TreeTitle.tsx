import React from 'react'
import Menu from 'antd/es/menu'

export interface TreeTitleProps {
  item: any
  onClick(item): void
}

const TreeTitle: React.FC<TreeTitleProps> = props => {
  const { item, onClick } = props
  const { url, title } = item

  if (!url) {
    return (
      <div>
        <span className='tree-title-dir-name'>{title}</span>  
      </div>
    )
  }

  const handleClick = e => {
    onClick(item)
    e.stopPropagation()
  }

  return (
    <div className="flex tree-title-container">
      <a
        href={url}
        target="_blank"
        className='tree-title-link'
        onClick={handleClick}
      >
        {title}
      </a>
      <div className="tree-actions flex-1 flex flex-row-reverse invisible">
        <span>1</span>
        <span>2</span>
        <span>3</span>
      </div>
    </div>
  )
}

export default TreeTitle
