import React from 'react'
import CheckOutlined from '@ant-design/icons/CheckOutlined'
import { useStorage } from '@plasmohq/storage/hook'
import './BackgroundContainer.less'

const colorList = [
  {
    border: "#E7E9E8",
    background: "#EFF0F0"
  },
  {
    border: "#81BBF8",
    background: "rgba(192, 221, 252, 0.5)"
  },
  {
    border: "#81DFE4",
    background: "rgba(181, 239, 242, 0.5)"
  },
  {
    border: "#82EDC0",
    background: "rgba(199, 240, 223, 0.5)"
  },
  {
    border: "#C1E77E",
    background: "rgba(219, 241, 183, 0.5)"
  },
  {
    border: "#F5D480",
    background: "rgba(246, 225, 172, 0.5)"
  },
  {
    border: "#F8B881",
    background: "rgba(248, 214, 185, 0.5)"
  },
  {
    border: "#F1A2AB",
    background: "rgba(248, 206, 211, 0.5)"
  },
  {
    border: "#F297CC",
    background: "rgba(247, 196, 226, 0.5)"
  },
  {
    border: "#BA9BF2",
    background: "rgba(217, 201, 248, 0.5)"
  },
]

export interface BackgroundContainerProps extends React.PropsWithChildren {
  strore_key: string
}

const BackgroundContainer: React.FC<BackgroundContainerProps> = props => {
  const { children, strore_key } = props

  const [color = colorList[0], setColor] = useStorage(strore_key)
  const [visible, setVisible] = React.useState(false)

  const handleColorChange = (e, item) => {
    setColor(item)
  }

  const { border, background } = color

  return (
    <div
      onClick={() => setVisible(!visible)}
      className='background-container'
      style={{ 
        background,
        borderColor: border,
      }}
    >
      <div className='color-list-container'>
        {colorList.map(item => {
          const check = item.border === color.border
          return (
            <div
              key={item.border}
              style={{ background: item.border }}
              onClick={e => handleColorChange(e, item)}
            >
              {check && <CheckOutlined />}
            </div>
          )
        })}
      </div>
      {children}
    </div>
  )
}

export default BackgroundContainer
