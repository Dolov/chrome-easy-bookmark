import React from "react"

import "~tailwindcss.css"

const Square = () => {
  const [loading, setLoading] = React.useState(false)
  const [data, setData] = React.useState([])

  React.useEffect(() => {
    chrome.identity.getAuthToken({ interactive: true }, function (token) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError)
        return
      }

      fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: "Bearer " + token
        }
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("User email: ", data.email)
          // 这里可以将邮箱存储到 chrome.storage
          chrome.storage.local.set({ email: data.email })
        })
        .catch((error) => console.error(error))
    })
  }, [])

  React.useEffect(() => {
    setLoading(true)
    fetch("https://easy-bookmark-server.freeless.cn/api/share/list")
      .then((res) => res.json())
      .then((res) => {
        if (res.status === 200) {
          setData(res.data)
        }
      })
      .finally(() => setLoading(false))
  }, [])
  // 中间布局
  return (
    <div>
      <div className="max-w-[640px] m-auto">
        {data.map((item) => {
          const { title, url, description, createAt, id } = item
          return (
            <div key={id}>
              <a href={url}>{title || url}</a>
              <p>{description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Square
