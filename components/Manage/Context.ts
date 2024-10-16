import React from "react"

const ManageContext = React.createContext<{
  loginVisible: boolean
  setLoginVisible: React.Dispatch<React.SetStateAction<boolean>>
  shareVisible: boolean
  setShareVisible: React.Dispatch<React.SetStateAction<boolean>>
  shareInfo: {
    url: string
    title: string
  }
  setShareInfo: React.Dispatch<
    React.SetStateAction<{
      url: string
      title: string
    }>
  >
}>({} as any)

export default ManageContext

const { Provider, Consumer } = ManageContext

export { ManageContext, Provider, Consumer }
