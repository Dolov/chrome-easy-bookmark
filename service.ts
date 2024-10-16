const serverUrl = "https://easy-bookmark-server.freeless.cn"

const GET = (url: string) =>
  fetch(`${serverUrl}${url}`, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token")
    }
  }).then((res) => res.json())

const POST = (url: string, data: any) =>
  fetch(`${serverUrl}${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify(data)
  }).then((res) => res.json())

export const getCategories = () => {
  return GET("/api/category/list")
}

export const createCategory = (data: any) => {
  return POST("/api/category/create", data)
}

export const getShareList = () => {
  return GET("/api/share/list")
}

export const signup = (data: any) => {
  return POST("/api/user/signup", data)
}

export const signin = (data: any) => {
  return POST("/api/user/signin", data)
}

export const sendotp = (data: any) => {
  return POST("/api/user/sendotp", data)
}
