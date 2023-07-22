import React from 'react'
import ManagerCore from './components/ManagerCore'
import type { ManagerCoreProps } from './components/ManagerCore'


const Manager: React.FC<ManagerCoreProps> = props => {
  return (
    <div className="px-5 pt-8">
      <ManagerCore {...props} />
    </div>
  )
}

export default Manager
