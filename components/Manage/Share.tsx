import { Button, Checkbox, Divider, Form, Input, Modal, Select } from "antd"
import React from "react"

import { serverUrl, type TreeNodeProps } from "~utils"

import { ManageContext } from "./Context"
import Login from "./Login"

const options = [
  { label: "工作工具", value: "work_tools" },
  { label: "学习资源", value: "learning_resources" },
  { label: "技术文档", value: "tech_docs" },
  { label: "前端开发", value: "frontend_development" },
  { label: "后端开发", value: "backend_development" },
  { label: "人工智能", value: "artificial_intelligence" },
  { label: "机器学习", value: "machine_learning" },
  { label: "编程教程", value: "programming_tutorials" },
  { label: "代码库", value: "code_repositories" },
  { label: "开源项目", value: "open_source_projects" },
  { label: "API参考", value: "api_references" },
  { label: "UI/UX设计", value: "ui_ux_design" },
  { label: "网页设计", value: "web_design" },
  { label: "灵感来源", value: "inspiration_sources" },
  { label: "字体和排版", value: "fonts_typography" },
  { label: "色彩搭配", value: "color_palettes" },
  { label: "图标库", value: "icon_libraries" },
  { label: "设计工具", value: "design_tools" },
  { label: "项目管理", value: "project_management" },
  { label: "生产力工具", value: "productivity_tools" },
  { label: "浏览器扩展", value: "browser_extensions" },
  { label: "新闻与媒体", value: "news_media" },
  { label: "科技博客", value: "tech_blogs" },
  { label: "开发者社区", value: "developer_communities" },
  { label: "编程挑战", value: "programming_challenges" },
  { label: "在线编程平台", value: "online_coding_platforms" },
  { label: "技术论坛", value: "tech_forums" },
  { label: "安全与隐私", value: "security_privacy" },
  { label: "云计算", value: "cloud_computing" },
  { label: "数据库管理", value: "database_management" },
  { label: "DevOps", value: "devops" },
  { label: "持续集成", value: "continuous_integration" },
  { label: "版本控制", value: "version_control" },
  { label: "工作流程优化", value: "workflow_optimization" },
  { label: "职业发展", value: "career_development" },
  { label: "团队协作", value: "team_collaboration" },
  { label: "数据可视化", value: "data_visualization" },
  { label: "区块链技术", value: "blockchain_technology" },
  { label: "移动开发", value: "mobile_development" },
  { label: "跨平台开发", value: "cross_platform_development" },
  { label: "电子商务", value: "ecommerce" },
  { label: "营销与SEO", value: "marketing_seo" },
  { label: "网络分析", value: "web_analytics" },
  { label: "教育平台", value: "education_platforms" },
  { label: "健康与健身", value: "health_fitness" },
  { label: "旅游计划", value: "travel_planning" },
  { label: "娱乐与休闲", value: "entertainment" },
  { label: "生活技巧", value: "life_hacks" },
  { label: "投资理财", value: "investment_finance" },
  { label: "自我提升", value: "self_improvement" }
]

const Share: React.FC = () => {
  const context = React.useContext(ManageContext)
  const { shareInfo, shareVisible, setShareVisible } = context
  const { url, title } = shareInfo || {}
  const [form] = Form.useForm()
  const [loginOpen, setLoginOpen] = React.useState(false)

  const [categorys, setCategorys] = React.useState(options)
  const [categoryValue, setCategoryValue] = React.useState("")
  const [createCategoryLoading, setCreateCategoryLoading] =
    React.useState(false)

  React.useEffect(() => {
    if (!shareVisible) return
    getCategories()
    form.setFieldsValue({
      url,
      title
    })
  }, [shareVisible])

  const handleShare = () => {
    const { url, title } = form.getFieldsValue()
  }

  const getCategories = () => {
    fetch(`${serverUrl}/api/category/list`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.status !== 200) return
        setCategorys([...options, ...res.data])
      })
  }

  const createCategory = () => {
    setCreateCategoryLoading(true)
    fetch(`${serverUrl}/api/category/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: categoryValue
      })
    }).finally(() => {
      setCreateCategoryLoading(false)
    })
  }

  const onCreateCategoryInputKeydown: React.KeyboardEventHandler<
    HTMLInputElement
  > = (event) => {
    event.stopPropagation()
    if (event.key !== "Enter") return
    createCategory()
  }

  const login = () => {
    setLoginOpen(true)
  }

  return (
    <>
      <Modal
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
                <span onClick={login} className="underline ml-2 cursor-pointer">
                  登录/创建账号？
                </span>
              </Form.Item>
            </div>
          </Form>
        </div>
      </Modal>
      <Login open={loginOpen} onCancel={() => setLoginOpen(false)} />
    </>
  )
}

export default Share
