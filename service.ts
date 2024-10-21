import { Storage } from "@plasmohq/storage"

import { StorageKeyEnum, type UserInfo } from "~utils"

const storage = new Storage()

const getToken = () => {
  return new Promise((resolve, reject) => {
    storage.get(StorageKeyEnum.USER_INFO).then((res: any) => {
      resolve(res?.token)
    })
  })
}

const serverUrl =
  process.env.NODE_ENV === "production"
    ? "https://easy-bookmark-server.freeless.cn"
    : "http://localhost:3000"

const GET = async (url: string) => {
  const token = await getToken()
  return fetch(`${serverUrl}${url}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then((res) => res.json())
}

const POST = async (url: string, data: any) => {
  const token = await getToken()
  return fetch(`${serverUrl}${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  }).then((res) => res.json())
}

export const sendotp = (data: any) => {
  return POST("/api/user/sendotp", data)
}

export const verifyotp = (data: any) => {
  return POST("/api/user/verifyotp", data)
}

export const signup = (data: any) => {
  return POST("/api/user/signup", data)
}

export const signin = (data: any) => {
  return POST("/api/user/signin", data)
}

export const getCategories = () => {
  return GET("/api/category/list")
}

export const createCategory = (data: any) => {
  return POST("/api/category/create", data)
}

export const getShareList = () => {
  return GET("/api/share/list")
}

export const createShare = (data: any) => {
  return POST("/api/share/create", data)
}
