import React from 'react'
import List from '~/components/List'
import "~tailwindcss.css"
import "~components/style.scss"

export interface AppProps {
  
}

const App: React.FC<AppProps> = props => {
  const {  } = props
  return (
    <List visible />
  )
}

export default App
