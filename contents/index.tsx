import React from "react"
import { StyleProvider } from "@ant-design/cssinjs"
import contentCss from "data-text:./style.scss"
import tailwindcss from "data-text:~tailwindcss.css"
import antdResetCssText from "data-text:antd/dist/reset.css"
import type { PlasmoCSConfig, PlasmoGetShadowHostId } from "plasmo"
import { GlobalAntdProvider } from "~GlobalAntdProvider"
import { useBoolean, MessageActionEnum } from '~/utils'
import List from './components/List'
import Create from './components/Create'

const HOST_ID = "easy-bookmark-host"

export const getShadowHostId: PlasmoGetShadowHostId = () => HOST_ID

export const config: PlasmoCSConfig = {
  run_at: "document_end",
  matches: ["<all_urls>"],
}

const getRoot = () => document.getElementById(HOST_ID).shadowRoot as unknown as HTMLElement

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = `
    ${tailwindcss}\n
    ${antdResetCssText}\n
    ${contentCss}\n
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