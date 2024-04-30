import React from 'react'
import Create from '~components/Create'
import "~tailwindcss.css"
import "~components/style.scss"

export interface AppProps {
  
}

const App: React.FC<AppProps> = props => {
  const {  } = props

  const { url, title } = React.useMemo(() => {
    const params = new URLSearchParams(location.search)
    const url = params.get('url')
    const title = params.get('title')
    return {
      url,
      title
    }
  }, [])
  return (
    <Create
      visible
      url={url}
      title={title}
    />
  )
}

export default App
