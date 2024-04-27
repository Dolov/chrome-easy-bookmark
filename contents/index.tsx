import React from "react"
import Mousetrap from 'mousetrap'
import { StyleProvider } from "@ant-design/cssinjs"
import antdResetCssText from "data-text:antd/dist/reset.css"
import type { PlasmoCSConfig, PlasmoGetShadowHostId, PlasmoCSUIProps } from "plasmo"
import { GlobalAntdProvider } from "~GlobalAntdProvider"
import { useBoolean, MessageActionEnum } from '~/utils'
import List from './components/List'
import Create from './components/Create'

const HOST_ID = "easy-bookmark-host"

export const getShadowHostId: PlasmoGetShadowHostId = () => HOST_ID

const getRoot = () => document.getElementById(HOST_ID).shadowRoot as unknown as HTMLElement

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = `
    ${antdResetCssText}\n
    .create-modal .ant-modal-close {
      top: 24px !important;
    }
    
  `
  return style
}

const App = () => {
  const [listVisible, toggleListVisible] = useBoolean()
  const [createVisible, toggleCreateVisible] = useBoolean()

  React.useEffect(() => {
    // Mousetrap.bind(['command+s', 'ctrl+s'], function () {
    //   toggleCreateVisible()
    //   return false;
    // });
  }, [])

  React.useEffect(() => {
    chrome.runtime.onMessage.addListener((params, sender, sendResponse) => {
      if (params.action === MessageActionEnum.ACTION_ON_CLICKED) {
        toggleCreateVisible()
      }
    })
  }, [])

  return (
    <GlobalAntdProvider getPopupContainer={getRoot}>
      <StyleProvider container={getRoot()}>
        <List 
          visible={listVisible}
          toggleVisible={toggleListVisible}
          
        />
        <Create
          visible={createVisible}
          toggleVisible={toggleCreateVisible}
          toggleListVisible={toggleListVisible}
        />
      </StyleProvider>
    </GlobalAntdProvider>
  )
}


export default App