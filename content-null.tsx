import React from 'react'
import type { PlasmoGetShadowHostId } from "plasmo"
import { useStorage } from '@plasmohq/storage/hook'
import Modal from 'antd/es/modal'
import { Namespace } from './utils'
import ManagerCore from './tabs/components/ManagerCore'
import './tabs/setting.less'

 
export const getShadowHostId: PlasmoGetShadowHostId = () => `easy-bookmark`


export interface contentProps {
  
}

const content: React.FC<contentProps> = props => {
  const {  } = props
  const [open, setOpen] = React.useState(false)
  const openRef = React.useRef(open)
  const [settings, setSettings] = useStorage(Namespace.SETTINGS)

  openRef.current = open

  React.useEffect(() => {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.type === 'open') {
        setOpen(!openRef.current)
      }
    })
  }, [])

  const { width, height } = settings || {}

  return (
    <div>
      <Modal
        open={open}
        width={width}
        style={{ height, top: (innerHeight - height) / 2 }}
        title="书签管理"
        onCancel={() => setOpen(false)}
        wrapClassName='setting-modal'
      >
        <span>123</span>
      </Modal>
    </div>  
  )
}

export default content
