import React from 'react'
import { parse } from 'qs'
import Input from 'antd/es/input'
import Form from 'antd/es/form'
import Button from 'antd/es/button'
import Tree from './components/Tree'
import { getDirTreeData, getOption, updateMoveBookMark, deleteBookMark } from '../utils'
import './remark.less'

export interface RemarkProps {

}

const Remark: React.FC<RemarkProps> = props => {
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

  const onDelete = async () => {
    if (!bookmarkRef.current) return
    await deleteBookMark(bookmarkRef.current.id)
    onCancel()
  }

  return (
    <div className="remark-page-container">
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
        <Form.Item
          label="上级目录"
          name="parentId"
          rules={[{ required: true }]}
          valuePropName='selectedKeys'
          trigger='onSelect'
        >
          <Tree
            treeData={treeData}
          />
        </Form.Item>
      </Form>
      <footer>
        <Button onClick={onSave} className='save-button' type="primary">保存</Button>
        <Button onClick={onDelete} className='delete-button' danger>移除</Button>
        <Button onClick={onCancel}>取消</Button>
      </footer>
    </div>
  )
}

export default Remark
