import React from 'react'
import Manage from '~components/Manage'
import "~tailwindcss.css"
import "~components/style.scss"

export interface AppProps {
  
}

const App: React.FC<AppProps> = props => {
  const {  } = props
  return (
    <Manage visible />
  )
}

export default App
