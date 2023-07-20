import React from 'react'
import { parse } from 'qs'
import { Button, Tree, Form, Input } from 'antd';
import { getDirTreeData, getOption, updateMoveBookMark } from '../utils'
import './remark.less'

export interface remarkProps {

}

const remark: React.FC<remarkProps> = props => {
  const [treeData, setTreeData] = React.useState([])
  const [form] = Form.useForm();
  const bookmarkRef = React.useRef(null)

  const id = React.useMemo(() => {
    return parse(location.search.replace("?", "")).id
  }, [])

  const setFieldsValue = treeData => {
    if (!id) return
    if (!treeData.length) return
    const bookmark = getOption(id, treeData)
    bookmarkRef.current = bookmark
    form.setFieldsValue({
      url: bookmark?.url,
      title: bookmark?.title,
    })
  }

  React.useEffect(() => {
    chrome.bookmarks.getTree().then(res => {
      setFieldsValue(res)
      const treeData = getDirTreeData(res)
      setTreeData(treeData[0].children)
    })
  }, [])

  const onCancel = () => {
    window.close()
  }

  const onSave = async () => {
    if (!bookmarkRef.current) return
    const values = form.getFieldsValue()
    const book = await updateMoveBookMark({
      ...bookmarkRef.current,
      url: values.url,
      title: values.title,
    }, values.parentId[0], 0)
    onCancel()
  }

  return (
    <div className="container">
      <header></header>
      <Form form={form} style={{ width: "100%" }}>
        <Form.Item
          label="名称"
          name="title"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="网址"
          name="url"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <div className="parent-node">
          <Form.Item
            label="上级目录"
            name="parentId"
            rules={[{ required: true }]}
            valuePropName='checkedKeys'
            trigger='onSelect'
          >
            <Tree
              defaultExpandAll
              height={415}
              treeData={treeData}
            />
          </Form.Item>
        </div>
      </Form>
      <footer>
        <Button onClick={onSave} className='save-button' type="primary">保存</Button>
        <Button onClick={onCancel}>取消</Button>
      </footer>
    </div>
  )
}

export default remark
