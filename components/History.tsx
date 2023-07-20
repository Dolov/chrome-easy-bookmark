import React from 'react'
import { Button } from 'antd'

export interface HistoryProps {
  data: any[]
}

const History: React.FC<HistoryProps> = props => {
  const { data } = props
  if (data.length === 0) return null
  return (
    <div className='history-container'>
      {data.map(item => {
        return (
          <Button type="text" key={item.id}>
            <a href={item.url} target="_blank">{item.title}</a>
          </Button>  
        )      
      })}
    </div>
  )
}

export default History
