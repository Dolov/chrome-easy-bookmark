import React from 'react'
import Mousetrap from 'mousetrap'
import { Modal, Form } from '@douyinfe/semi-ui'
import { type FormApi } from '@douyinfe/semi-ui/lib/es/form'
import type { PlasmoCSConfig, PlasmoGetShadowHostId, PlasmoCSUIProps } from "plasmo"
import { useBoolean, MessageActionEnum, formatBookmarkTreeNodes, findTreeNode } from '../utils'


export const getShadowHostId: PlasmoGetShadowHostId = () => `easy-bookmark`

export const config: PlasmoCSConfig = {
	run_at: "document_end",
	matches: ["<all_urls>"],
	// all_frames: true
}


const AnchorTypePrinter: React.FC<PlasmoCSUIProps> = (props) => {

	const formRef = React.useRef<FormApi>()
	const [visible, toggle] = useBoolean()
	const [disabled, setDisabled] = React.useState(false)
	const [treeNodes, setTreeNodes] = React.useState([])
	const [treeNodeDirs, setTreeNodeDirs] = React.useState([])
	const [bookmark, setBookmark] = React.useState<chrome.bookmarks.BookmarkTreeNode>()

	React.useEffect(() => {
		Mousetrap.bind(['command+s', 'ctrl+s'], function () {
			toggle()
			return false;
		});
	}, [])

	React.useEffect(() => {
		init()
	}, [])

	const init = () => {
		chrome.runtime.sendMessage({
			action: MessageActionEnum.GET_BOOKMARK_TREE
		}, treeNodes => {
			const formattedTreeNodes = formatBookmarkTreeNodes(treeNodes)
			const url = location.href
			const node = findTreeNode(url, treeNodes)
			setBookmark(node)
			setTreeNodes(treeNodes)
			setTreeNodeDirs(formattedTreeNodes[0].children)
		});
	}

	const save = () => {
		const action = bookmark ? MessageActionEnum.UPDATE_BOOKMARK: MessageActionEnum.CREATE_BOOKMARK
		const values = formRef.current.getValues()
		chrome.runtime.sendMessage({
			action,
			payload: {
				id: bookmark?.id,
				url: location.href,
				title: values.title,
			},
		}, res => {
			init()
			toggle()
		});
	}

	const onValueChange = values => {
		const disabled = !values.title || !values.parentId
		setDisabled(disabled)
	}

	const modalType = bookmark ? "新建书签": "编辑书签"

	const { title = document.title, parentId = "1" } = bookmark || {}

	return (
		<div>
			<Modal
				title={modalType}
				visible={visible}
				onOk={save}
				onCancel={toggle}
				okButtonProps={{
					disabled,
					autoFocus: true,
				}}
			>
				<Form
					onValueChange={onValueChange}
					getFormApi={api => {
						formRef.current = api
					}}
					style={{ width: "100%" }}
					layout="vertical"
					labelWidth={70}
					labelAlign="left"
					labelPosition="left"
					initValues={{ title, parentId }}
				>
					<Form.Input field='title' label='名称' style={{ width: 300 }} />
					<Form.TreeSelect
						filterTreeNode
						searchAutoFocus
						showSearchClear
						showFilteredOnly
						field='parentId'
						label='文件夹'
						style={{ width: 300 }}
						treeData={treeNodeDirs}
						dropdownMatchSelectWidth={true}
						dropdownStyle={{ maxWidth: 800, maxHeight: "80vh", overflow: "auto" }}
					/>
				</Form>
			</Modal>
		</div>
	)
}

export default AnchorTypePrinter