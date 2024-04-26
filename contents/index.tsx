import React from "react"
import { StyleProvider } from "@ant-design/cssinjs"
import { Button, Modal  } from 'antd'
import antdResetCssText from "data-text:antd/dist/reset.css"
import type { PlasmoGetShadowHostId } from "plasmo"

import { GlobalAntdProvider } from "~GlobalAntdProvider"


const HOST_ID = "easy-bookmark-host"

export const getShadowHostId: PlasmoGetShadowHostId = () => HOST_ID

const getRoot = () => document.getElementById(HOST_ID).shadowRoot as unknown as HTMLElement

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = antdResetCssText
  return style
}

const EngageOverlay = () => {
  const [visible, setVisible] = React.useState(false)
  

  return (
    <GlobalAntdProvider>
      <StyleProvider container={document.getElementById(HOST_ID).shadowRoot}>
        <Button onClick={() => setVisible(true)} type="primary">open</Button>
        <Modal
          open={visible}
          getContainer={getRoot}
          onCancel={() => setVisible(false)}
        >
          <h1>123</h1>
        </Modal>
      </StyleProvider>
    </GlobalAntdProvider>
  )
}

export default EngageOverlay