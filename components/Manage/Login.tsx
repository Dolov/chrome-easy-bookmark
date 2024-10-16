import { Form, Input, Modal } from "antd"
import loginImage from "data-base64:~assets/login-bg.webp"
import React from "react"

import { BxsUser, MaterialSymbolsShieldLockedSharp, MdiEmail } from "../Icon"
import { ManageContext } from "./Context"

const Login: React.FC = () => {
  const context = React.useContext(ManageContext)
  const { loginVisible, setLoginVisible } = context
  return (
    <Modal
      closable={false}
      okText="登录"
      cancelText="取消"
      open={loginVisible}
      width={800}
      onCancel={() => setLoginVisible(false)}>
      <div className="flex h-[350px]">
        <div className="flex-1 p-6">
          <Form size="large">
            <Form.Item required name="username">
              <Input
                prefix={<BxsUser className="text-slate-500" />}
                placeholder="昵称"
              />
            </Form.Item>
            <Form.Item required name="email">
              <Input
                prefix={<MdiEmail className="text-slate-500" />}
                placeholder="邮箱"
              />
            </Form.Item>
            <Form.Item required name="otp">
              <Input.OTP length={6} />
            </Form.Item>
            <Form.Item required name="password">
              <Input.Password
                prefix={
                  <MaterialSymbolsShieldLockedSharp className="text-slate-500" />
                }
                placeholder="密码"
              />
            </Form.Item>
          </Form>
        </div>
        <div className="flex-1 p-6">
          <Form layout="vertical">
            <Form.Item required name="email" label="邮箱">
              <Input placeholder="邮箱" />
            </Form.Item>
            <Form.Item required name="password" label="密码">
              <Input.Password placeholder="密码" />
            </Form.Item>
          </Form>
        </div>
      </div>
    </Modal>
  )
}

export default Login

const Register = () => {
  return <div>Register</div>
}

// ;<div
//   style={{ backgroundImage: `url(${loginImage})` }}
//   className="h-[350px] bg-cover flex">
//   <div
//     style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
//     className="bg-opacity-60 flex-1"></div>
// </div>
