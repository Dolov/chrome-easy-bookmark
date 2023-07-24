import React from 'react'
import BackgroundContainer from './BackgroundContainer'

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
    <BackgroundContainer className="mb-3" strore_key='history-color'>
      <div className='history-container'>
        {histroyData.map(item => {
        const { title, id, url } = item
          return (
            <span title={title} className='history-item' key={id}>
              <a href={url} target="_blank">{title}</a>
            </span>  
          )      
        })}
      </div>
    </BackgroundContainer>
  )
}

export default History
