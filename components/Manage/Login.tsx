import { Button, Form, Input, Modal, Tabs } from "antd"
import React from "react"

import { baseZIndex } from "~utils"

import { sendotp, verifyotp } from "../../service"
import { BxsUser, MaterialSymbolsShieldLockedSharp, MdiEmail } from "../Icon"
import { ManageContext } from "./Context"

const { TabPane } = Tabs

const Login: React.FC = () => {
  const context = React.useContext(ManageContext)
  const { loginVisible, setLoginVisible } = context
  return (
    <Modal
      open={loginVisible}
      width={800}
      zIndex={baseZIndex}
      footer={null}
      closable={false}
      onCancel={() => setLoginVisible(false)}>
      <div className="flex h-[360px]">
        <div className="flex-1 h-full">
          <Tabs className="w-[400px] m-auto" defaultActiveKey="1" centered>
            <TabPane tab="登录" key="1">
              <LoginContent />
            </TabPane>
            <TabPane tab="注册" key="2">
              <RegisterContent />
            </TabPane>
          </Tabs>
        </div>
      </div>
    </Modal>
  )
}

export default Login

const LoginContent = () => {
  return (
    <div>
      <Form size="large">
        <Form.Item required name="email">
          <Input
            prefix={<MdiEmail className="text-slate-500" />}
            placeholder="邮箱"
          />
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
      <Button block type="primary">
        登录
      </Button>
    </div>
  )
}

const RegisterContent = () => {
  const [form] = Form.useForm()

  const handleSendOTP = async () => {
    const { username, email } = form.getFieldsValue()
    const res = await sendotp({
      email,
      username
    })
    console.log("res: ", res)
  }

  const handleVerifyOTP = async () => {
    const { otp, email } = form.getFieldsValue()
    const res = await verifyotp({
      otp,
      email
    })
    console.log("res: ", res)
  }

  return (
    <div>
      <Form form={form} size="large">
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
        <div className="flex justify-between">
          <Form.Item required name="otp">
            <Input.OTP length={6} onChange={handleVerifyOTP} />
          </Form.Item>
          <Button onClick={handleSendOTP}>发送验证码</Button>
        </div>
        <Form.Item required name="password">
          <Input.Password
            prefix={
              <MaterialSymbolsShieldLockedSharp className="text-slate-500" />
            }
            placeholder="密码"
          />
        </Form.Item>
      </Form>
      <Button block type="primary">
        注册
      </Button>
    </div>
  )
}
