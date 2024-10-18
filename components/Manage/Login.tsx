import { Button, Form, Input, Modal, Tabs } from "antd"
import React from "react"

import { baseZIndex, emailRegex } from "~utils"

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

  const [time, setTime] = React.useState(0)
  const [sendLoading, setSendLoading] = React.useState(false)
  const [verifyDisabled, setVerifyDisabled] = React.useState(true)
  const otpInputRef = React.useRef(null)

  const handleSendOTP = async () => {
    const { username, email } = form.getFieldsValue()
    setSendLoading(true)
    const res = await sendotp({
      email,
      username
    }).finally(() => {
      setSendLoading(false)
    })
    const { status, data } = res
    if (status !== 200) return
    otpInputRef.current.focus()
    setVerifyDisabled(true)
    setTime(data * 60)
    const timer = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime > 0) return prevTime - 1
        clearInterval(timer)
        setVerifyDisabled(false)
        return 0
      })
    }, 1000)
  }

  const handleVerifyOTP = async () => {
    const { otp, email } = form.getFieldsValue()
    const res = await verifyotp({
      otp,
      email
    })
  }

  const onValuesChange = (changedValues, allValues) => {
    const { email } = allValues
    if (emailRegex.test(email) && time === 0) {
      setVerifyDisabled(false)
    } else {
      setVerifyDisabled(true)
    }
  }

  const handleRegister = () => {
    form.validateFields().then((error) => {
      console.log("error: ", error)
      const values = form.getFieldsValue()
      console.log(values)
    })
  }

  const buttonText = time ? `${time} 秒内有效` : "发送验证码"

  return (
    <div>
      <Form form={form} size="large" onValuesChange={onValuesChange}>
        <Form.Item rules={[{ required: true, message: "" }]} name="username">
          <Input
            prefix={<BxsUser className="text-slate-500" />}
            placeholder="昵称"
          />
        </Form.Item>
        <Form.Item rules={[{ required: true, message: "" }]} name="email">
          <Input
            prefix={<MdiEmail className="text-slate-500" />}
            placeholder="邮箱"
          />
        </Form.Item>
        <div className="flex justify-between">
          <Form.Item rules={[{ required: true, message: "" }]} name="otp">
            <Input.OTP
              ref={otpInputRef}
              length={6}
              onChange={handleVerifyOTP}
            />
          </Form.Item>
          <Button
            loading={sendLoading}
            disabled={verifyDisabled}
            onClick={handleSendOTP}>
            {buttonText}
          </Button>
        </div>
        <Form.Item rules={[{ required: true, message: "" }]} name="password">
          <Input.Password
            prefix={
              <MaterialSymbolsShieldLockedSharp className="text-slate-500" />
            }
            placeholder="密码"
          />
        </Form.Item>
      </Form>
      <Button block onClick={handleRegister} type="primary">
        注册
      </Button>
    </div>
  )
}
