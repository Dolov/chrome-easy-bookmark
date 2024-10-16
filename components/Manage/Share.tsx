import { Button, Checkbox, Divider, Form, Input, Modal, Select } from "antd"
import React from "react"

import { getCategories, createCategory as sendCategory } from "~service"
import { baseZIndex, type TreeNodeProps } from "~utils"

import { ManageContext } from "./Context"

const Share: React.FC = () => {
  const context = React.useContext(ManageContext)
  const { shareInfo, shareVisible, setShareVisible, setLoginVisible } = context
  const { url, title } = shareInfo || {}
  const [form] = Form.useForm()

  const [categorys, setCategorys] = React.useState([])
  const [categoryValue, setCategoryValue] = React.useState("")
  const [createCategoryLoading, setCreateCategoryLoading] =
    React.useState(false)

  React.useEffect(() => {
    if (!shareVisible) return
    fetchCategories()
    form.setFieldsValue({
      url,
      title
    })
  }, [shareVisible])

  const handleShare = () => {
    const { url, title } = form.getFieldsValue()
  }

  const fetchCategories = async () => {
    const res = await getCategories()
    if (res.status !== 200) return
    if (!res.data) return
    const options = res.data.map((item) => {
      return {
        ...item,
        label: item.name,
        value: item.id
      }
    })
    setCategorys(options)
  }

  const createCategory = async () => {
    setCreateCategoryLoading(true)
    const name = categoryValue
    const res = await sendCategory({ name }).finally(() => {
      setCreateCategoryLoading(false)
    })
    console.log("res: ==", res)
    if (res.status !== 200) return
    setCategoryValue("")
    fetchCategories()
  }

  const onCreateCategoryInputKeydown: React.KeyboardEventHandler<
    HTMLInputElement
  > = (event) => {
    event.stopPropagation()
    if (event.key !== "Enter") return
    createCategory()
  }

  return (
    <Modal
      zIndex={baseZIndex}
      open={shareVisible}
      title="分享到广场"
      okText="确定"
      onOk={handleShare}
      onCancel={() => setShareVisible(false)}
      cancelText="取消">
      <div className="mt-6">
        <Form form={form} labelCol={{ span: 4 }}>
          <Form.Item required name="url" label="书签链接">
            <Input />
          </Form.Item>
          <Form.Item required name="title" label="书签标题">
            <Input.TextArea autoSize />
          </Form.Item>
          <Form.Item required name="description" label="分享原因">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="category" label="书签分类">
            <Select
              allowClear
              showSearch
              mode="multiple"
              maxCount={3}
              options={categorys}
              optionFilterProp="label"
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider className="my-2" />
                  <div className="flex px-2 pb-2">
                    <Input
                      className="w-full"
                      value={categoryValue}
                      onChange={(e) => setCategoryValue(e.target.value)}
                      onKeyDown={onCreateCategoryInputKeydown}
                      placeholder="自定义分类"
                    />
                    <Button
                      type="text"
                      loading={createCategoryLoading}
                      className="ml-2"
                      onClick={createCategory}>
                      新建
                    </Button>
                  </div>
                </>
              )}
            />
          </Form.Item>
          <div className="flex items-center justify-end">
            <Form.Item name="anonymous" label="">
              <Checkbox>匿名分享</Checkbox>
            </Form.Item>
            <Form.Item>
              <span
                onClick={() => setLoginVisible(true)}
                className="underline ml-2 cursor-pointer">
                登录/创建账号？
              </span>
            </Form.Item>
          </div>
        </Form>
      </div>
    </Modal>
  )
}

export default Share
