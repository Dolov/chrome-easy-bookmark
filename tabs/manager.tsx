import React from 'react'
import ConfigProvider from 'antd/es/config-provider'
import zh_CN from 'antd/locale/zh_CN'
import ManagerCore from './components/ManagerCore'
import type { ManagerCoreProps } from './components/ManagerCore'
import './manager.less'


const Manager: React.FC<ManagerCoreProps> = props => {
  return (
    <ConfigProvider locale={zh_CN}>
      <div className="px-5 pt-8 pb-6 flex-1 flex overflow-hidden">
        <ManagerCore {...props} />
      </div>
    </ConfigProvider>
  )
}

export default Manager
