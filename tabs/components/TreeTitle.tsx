import React from 'react'
import Dropdown from 'antd/es/dropdown'
import Popconfirm from 'antd/es/popconfirm'
import type { MenuProps } from 'antd'
import DeleteFilled from '@ant-design/icons/DeleteFilled'
import { deleteBookMark } from '../../utils'

export interface TreeTitleProps {
  item: any
  refresh(): void
  onClick(item): void
}

const TreeTitle: React.FC<TreeTitleProps> = props => {
  const { item, onClick, refresh } = props
  const { url, title } = item

  const items: MenuProps['items'] = [
    {
      label: '1st menu item',
      key: '1',
    },
    {
      label: '2nd menu item',
      key: '2',
    },
    {
      label: '3rd menu item',
      key: '3',
    },
  ];

  if (!url) {
    return (
      <div>
        <span className="font-bold">{title}</span>  
      </div>
    )
  }

  const handleClick = e => {
    onClick(item)
    e.stopPropagation()
  }

  const onDelete = async () => {
    await deleteBookMark(item.id)
    refresh()
  }

  return (
    <Dropdown menu={{ items }} trigger={['contextMenu']}>
      <div>
        <div className="flex tree-title-container">
        <a
          href={url}
          target="_blank"
          onClick={handleClick}
          className="hover:underline"
        >
          {title}
        </a>
        <div className="tree-actions flex-1 flex flex-row-reverse invisible">
          <span className="flex items-center">
            <Popconfirm title="确定删除？" onConfirm={onDelete}>
              <DeleteFilled
                title='删除'
                className="flex items-center text-base text-red-600"
              />
            </Popconfirm>
          </span>
        </div>
      </div>
      </div>
    </Dropdown>
  )
}

export default TreeTitle
