import React from 'react'
import Button from 'antd/es/button'
import Tooltip from 'antd/es/tooltip'
import DeleteFilled from '@ant-design/icons/DeleteFilled'
import EditFilled from '@ant-design/icons/EditFilled'
import ChromeFilled from '@ant-design/icons/ChromeFilled'
import BackgroundContainer from './BackgroundContainer'
import { Namespace } from '../../utils'

export interface BatchActionsProps {
  selectedKeys: string[]
}

const BatchActions: React.FC<BatchActionsProps> = props => {
  const { selectedKeys } = props

  const count = selectedKeys.length
  return (
    <BackgroundContainer
      margin
      padding
      strore_key={Namespace.BATCH_ACTIONS_COLOR}
      className="flex justify-between items-center"
    >
      <div className="font-bold text-sm">共选择了 {count} 条数据</div>
      <div className="flex-1 flex justify-end">
        <Tooltip title={`打开全部 ${count} 个书签`}>
          <Button
            type="text"
            shape="circle"
            icon={<ChromeFilled />}
          />
        </Tooltip>
        <Tooltip title={`在新窗口中打开全部 ${count} 个书签`}>
          <Button
            type="text"
            shape="circle"
            icon={<ChromeFilled />}
          />
        </Tooltip>
        <Tooltip title={`在无痕式窗口中打开全部 ${count} 个书签`}>
          <Button
            type="text"
            shape="circle"
            icon={<ChromeFilled className="opacity-50" />}
          />
        </Tooltip>
        <Tooltip title={`在新标签页组中打开 ${count} 个书签`}>
          <Button
            type="text"
            shape="circle"
            icon={<ChromeFilled />}
          />
        </Tooltip>
        <Tooltip title="批量编辑">
          <Button
            type="text"
            shape="circle"
            icon={<EditFilled className="hover:text-blue-600" />}
          />
        </Tooltip>
        <Tooltip title="批量删除">
          <Button
            type="text"
            shape="circle"
            icon={<DeleteFilled className="hover:text-red-600" />}
          />
        </Tooltip>
      </div>
    </BackgroundContainer>
  )
}

export default BatchActions
