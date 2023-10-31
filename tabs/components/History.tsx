import React from 'react'
import BackgroundContainer from './BackgroundContainer'
import { Namespace } from '../../utils'

export interface HistoryProps {
  data: any[]
}

const History: React.FC<HistoryProps> = props => {
  const { data } = props

  const histroyData = React.useMemo(() => {
    const ids = data.map(item => item.id)
    const pureIds = Array.from(new Set(ids))
    return pureIds.map(id => data.find(item => item.id === id))
  }, [data])

  if (histroyData.length === 0) return null
  
  return (
    <BackgroundContainer
      margin
      padding
      className="history-container flex flex-wrap"
      strore_key={Namespace.HISTORY_COLOR}
    >
      {histroyData.map(item => {
        const { title, id, url, originalTitle } = item
        const renderTitle = originalTitle || title
        return (
          <span
            key={id}
            title={title}
            className="w-[120px] overflow-hidden inline-block mr-2"
          >
            <a
              href={url}
              target="_blank"
              className="w-full whitespace-nowrap text-ellipsis underline overflow-hidden block hover:text-blue-600"
            >
              {renderTitle}
            </a>
          </span>  
        )      
      })}
    </BackgroundContainer>
  )
}

export default History
