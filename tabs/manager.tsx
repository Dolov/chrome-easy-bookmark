import React from 'react'
import ManagerCore from './components/ManagerCore'
import type { ManagerCoreProps } from './components/ManagerCore'
import './manager.less'


const Manager: React.FC<ManagerCoreProps> = props => {
  return (
    <div className="px-5 pt-8 flex-1 flex overflow-hidden">
      <ManagerCore {...props} />
    </div>
  )
}

export default Manager
