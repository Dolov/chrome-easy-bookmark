import React from 'react'
import { Button } from 'antd'
import { DeleteFilled, CopyFilled, FolderOpenFilled, DownloadOutlined, ChromeFilled } from '@ant-design/icons'
import { type TreeNodeProps } from '~utils'

export interface HandlerBarProps {
  dataSource: TreeNodeProps[]
  checkedKeys: string[]
}

const HandlerBar: React.FC<HandlerBarProps> = props => {
  const { checkedKeys } = props
  const visible = checkedKeys.length > 0

  return (
    <div className="mb-2 min-h-[1]">
      {visible && (
        <div className="flex justify-between items-center">
          <span className="ml-2 font-bold">选中 {checkedKeys.length} 项</span>
          <div>
            <Button type="text" shape="circle">
              <ChromeFilled />
            </Button>
            <Button type="text" shape="circle">
              <CopyFilled />
            </Button>
            <Button type="text" shape="circle">
              <DownloadOutlined />
            </Button>
            <Button danger type="text" shape="circle">
              <DeleteFilled />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default HandlerBar
