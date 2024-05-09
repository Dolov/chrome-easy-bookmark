import React from 'react'
import { GlobalAntdProvider } from '~GlobalAntdProvider'

export interface SettingsProps {
  
}

const Settings: React.FC<SettingsProps> = props => {
  const {  } = props
  return (
    <GlobalAntdProvider>
      <div>Settings</div>
    </GlobalAntdProvider>
  )
}

export default Settings
