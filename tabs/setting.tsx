import React from 'react'
import ConfigProvider from 'antd/es/config-provider'
import Radio from 'antd/es/radio'
import Form from 'antd/es/form'
import message from 'antd/es/message'
import Button from 'antd/es/button'
import InputNumber from 'antd/es/input-number'
import Modal from 'antd/es/modal'
import Checkbox from 'antd/es/checkbox'
import { useStorage } from '@plasmohq/storage/hook'
import ManagerCore from './components/ManagerCore'
import zh_CN from 'antd/locale/zh_CN'
import { Namespace, openPage, initialSettings } from '../utils'
import './setting.less'

export interface SettingProps {

}

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
};

const options = [
  { label: '弹窗', value: 'window' },
  { label: '弹层', value: 'modal' },
  { label: '侧边栏', value: 'side_bar' },
];

const Setting: React.FC<SettingProps> = props => {
  const { } = props
  const [form] = Form.useForm()
  const [settings, setSettings] = useStorage(Namespace.SETTINGS)
  const [open, setOpen] = React.useState(false)
  const currentSettingRef = React.useRef(initialSettings)

  const [] = React.useState()

  React.useEffect(() => {
    form.setFieldsValue(settings)
  }, [settings])

  const preview = () => {
    const currentSettings = form.getFieldsValue()
    currentSettingRef.current = currentSettings
    const { showType, width, height } = currentSettings
    if (showType === 'window') {
      openPage(`./tabs/manager.html`, {
        width,
        height,
      })
    }
    if (showType === 'modal') {
      setOpen(true)
    }
  }

  const save = () => {
    const currentSettings = form.getFieldsValue()
    setSettings(currentSettings)
    message.success("配置项保存成功")
  }

  const { width, height, history } = currentSettingRef.current || {}

  return (
    <ConfigProvider locale={zh_CN}>
      <div className="flex justify-center">
        <div className="w-10/12 mt-6">
          <Form {...layout} form={form} initialValues={initialSettings}>
            <Form.Item label="展示方式" name="showType">
              <Radio.Group
                options={options}
                optionType="button"
              />
            </Form.Item>
            <Form.Item label="宽度" name="width">
              <InputNumber />
            </Form.Item>
            <Form.Item label="高度" name="height">
              <InputNumber />
            </Form.Item>
            <Form.Item label="展示访问记录" name="history" valuePropName='checked'>
              <Checkbox>展示访问记录</Checkbox>
            </Form.Item>
          </Form>
          <div className="flex flex-row-reverse">
            <Button onClick={save}>保存</Button>
            <Button onClick={preview}>预览</Button>
          </div>
        </div>
        <Modal
          open={open}
          width={width}
          style={{ height, top: (innerHeight - height) / 2 }}
          title="书签管理"
          onCancel={() => setOpen(false)}
          wrapClassName='setting-modal'
        >
          <ManagerCore
            height={height}
            showHistory={history}
          />
        </Modal>
      </div>
    </ConfigProvider>
  )
}

export default Setting
