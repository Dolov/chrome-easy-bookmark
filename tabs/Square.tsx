import { Avatar } from "antd"
import dayjs from "dayjs"
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"
import relativeTime from "dayjs/plugin/relativeTime"
import React from "react"

import { getShareList } from "~service"

import "~tailwindcss.css"

dayjs.extend(relativeTime)
dayjs.extend(isSameOrAfter)

const formatDate = (inputDate) => {
  const now = dayjs()
  const date = dayjs(inputDate)

  // 判断是否超过一个月
  if (now.diff(date, "month") >= 1) {
    return date.format("YYYY-MM-DD") // 超过一个月则返回具体日期
  } else {
    return date.from(now) // 否则返回多久前
  }
}

const defaultAvatar =
  "https://pbs.twimg.com/profile_images/1759752418190069760/Kysh6UY2_x96.jpg"

const Background: React.FC<{
  children: React.ReactNode
}> = (props) => {
  const { children } = props
  return (
    <div className="relative isolate overflow-hidden bg-gray-900 h-full">
      <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl xl:-top-6">
        <div
          className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
          }}
        />
      </div>
      {children}
    </div>
  )
}

const Square = () => {
  const [loading, setLoading] = React.useState(false)
  const [data, setData] = React.useState([])

  React.useEffect(() => {}, [])

  React.useEffect(() => {
    setLoading(true)
    getShareList()
      .then((res) => {
        setData(res.data)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])
  // 中间布局
  return (
    <Background>
      <div className="max-w-[640px] m-auto text-gray-300">
        {data.map((item) => {
          const { title, url, description, createdAt, id, user } = item
          const email = user?.email
          const username = user?.username || "匿名"
          const avatarUrl = user?.avatar || defaultAvatar
          return (
            <div
              style={{ background: "rgba(0, 0, 0, 0.3)" }}
              className="flex bg-gradient-to-br to-black from-gray-800 p-4 rounded-lg mt-4"
              key={id}>
              <div className="mr-4">
                <Avatar src={avatarUrl} />
              </div>
              <div className="flex-1">
                <div>
                  <span>{username}</span>
                  {email && <span className="ml-2 text-gray-400">{email}</span>}
                  <span className="ml-2 text-gray-400">
                    {formatDate(createdAt)}
                  </span>
                </div>
                <div className="mt-2">
                  {description}
                  <a
                    className="hover:text-blue-500 hover:underline ml-4 text-gray-400"
                    href={url}
                    title={title}
                    target="_blank">
                    {title || url}
                  </a>
                </div>
                <div className="mt-2 flex justify-between">
                  <div>
                    <span className="text-gray-400">star</span>
                    <span className="text-gray-400 ml-6">coll</span>
                  </div>
                  <div>
                    <span className="text-gray-400">1</span>
                    <span className="text-gray-400 ml-6">3</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Background>
  )
}

export default Square
