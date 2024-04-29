import React from "react"
import { StyleProvider } from "@ant-design/cssinjs"
import antdResetCssText from "data-text:antd/dist/reset.css"
import contentCss from "data-text:./style.scss"
import type { PlasmoCSConfig, PlasmoGetShadowHostId, PlasmoCSUIProps } from "plasmo"
import { GlobalAntdProvider } from "~GlobalAntdProvider"
import { useBoolean, MessageActionEnum } from '~/utils'
import List from './components/List'
import Create from './components/Create'

const HOST_ID = "easy-bookmark-host"

export const getShadowHostId: PlasmoGetShadowHostId = () => HOST_ID

export const config: PlasmoCSConfig = {
	run_at: "document_start",
	matches: ["<all_urls>"],
}

const getRoot = () => document.getElementById(HOST_ID).shadowRoot as unknown as HTMLElement

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = `
    ${antdResetCssText}\n
    ${contentCss}
  `
  return style
}

const App = () => {
  const [listVisible, toggleListVisible] = useBoolean()
  const [createVisible, toggleCreateVisible] = useBoolean()

  React.useEffect(() => {
    chrome.runtime.onMessage.addListener((params, sender, sendResponse) => {
      const { action, payload } = params
      if (action === MessageActionEnum.ACTION_ON_CLICKED) {
        toggleCreateVisible()
        return
      }
      if (action === MessageActionEnum.COMMAND && payload.command === "create-bookmark") {
        toggleCreateVisible()
        return
      }
      if (action === MessageActionEnum.COMMAND && payload.command === "show-all-bookmarks") {
        toggleListVisible()
        return
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