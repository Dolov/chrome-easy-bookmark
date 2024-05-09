import React from 'react'
import Manage from '~components/Manage'
import { GlobalAntdProvider } from '~GlobalAntdProvider'
import "~tailwindcss.css"
import "~components/style.scss"

export interface AppProps {
  
}

const App: React.FC<AppProps> = props => {
  const {  } = props
  return (
    <GlobalAntdProvider>
      <Manage visible />
    </GlobalAntdProvider>    
  )
}

export default App
