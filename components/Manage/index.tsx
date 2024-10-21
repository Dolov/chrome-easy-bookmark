import React from "react"

import { Provider } from "./Context"
import Login from "./Login"
import Main from "./Main"
import Share from "./Share"

const ManageContainer: React.FC<{
  visible: boolean
}> = (props) => {
  const [shareInfo, setShareInfo] = React.useState(null)
  const [loginVisible, setLoginVisible] = React.useState(false)
  const [shareVisible, setShareVisible] = React.useState(false)

  return (
    <Provider
      value={{
        loginVisible,
        setLoginVisible,
        shareVisible,
        setShareVisible,
        shareInfo,
        setShareInfo
      }}>
      <Main {...props} />
      <Share />
      <Login />
    </Provider>
  )
}

export default ManageContainer
