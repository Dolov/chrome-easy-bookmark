import React from 'react'
import Mousetrap from 'mousetrap'
import { Modal, Form, Button } from '@douyinfe/semi-ui'
import { IconBookmark } from '@douyinfe/semi-icons'
import { type FormApi } from '@douyinfe/semi-ui/lib/es/form'
import type { PlasmoCSConfig, PlasmoGetShadowHostId, PlasmoCSUIProps } from "plasmo"
import { useBoolean, MessageActionEnum, formatBookmarkTreeNodes, findTreeNode } from '../utils'


export const getShadowHostId: PlasmoGetShadowHostId = () => `easy-bookmark`

export const config: PlasmoCSConfig = {
	run_at: "document_end",
	matches: ["<all_urls>"],
	// all_frames: true
}

const defaultParentId = "1"

const AnchorTypePrinter: React.FC<PlasmoCSUIProps> = (props) => {

	const formRef = React.useRef<FormApi>()
	const [visible, toggle, visibleRef] = useBoolean()
	const [disabled, setDisabled] = React.useState(false)
	const [treeNodes, setTreeNodes] = React.useState([])
	const [treeNodeDirs, setTreeNodeDirs] = React.useState([])
	const [bookmark, setBookmark] = React.useState<chrome.bookmarks.BookmarkTreeNode>()

	React.useEffect(() => {
		Mousetrap.bind(['command+s', 'ctrl+s'], function () {
			toggle()
			if (!visibleRef.current) return false
			init()
			return false;
		});
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
		const { parentId = defaultParentId, title } = formRef.current.getValues()
		const payload: Partial<chrome.bookmarks.BookmarkTreeNode> = {
			title,
			url: location.href,
		}
		let action = MessageActionEnum.CREATE_BOOKMARK
		if (bookmark) {
			payload.id = bookmark.id
			action = MessageActionEnum.UPDATE_BOOKMARK
			if (bookmark.parentId !== parentId) {
				action = MessageActionEnum.MOVE_BOOKMARK
				payload.parentId = parentId
			}
		} else {
			payload.parentId = parentId
		}

		chrome.runtime.sendMessage({
			action,
			payload,
		}, res => {
			init()
			toggle()
		});
	}

	const onValueChange = values => {
		const disabled = !values.title || !values.parentId
		setDisabled(disabled)
	}

	const handleDelete = () => {
		chrome.runtime.sendMessage({
			id: bookmark.id,
			action: MessageActionEnum.DELETE_BOOKMARK,
		}, res => {
			init()
			toggle()
		});
	}

	const showAll = () => {
		
	}

	const create = !bookmark
	const modalType = create ? "新建书签" : "编辑书签"

	const { title = document.title, parentId = defaultParentId } = bookmark || {}

	return (
		<div>
			<Modal
				title={(
					<div style={{ display: "flex", alignItems: "center" }}>
						<Button type="primary" onClick={showAll}><IconBookmark /></Button>
						<span style={{ marginLeft: 16 }}>{modalType}</span>
					</div>
				)}
				visible={visible}
				onOk={save}
				onCancel={toggle}
				footer={<ModalFooter handleDelete={handleDelete} save={save} toggle={toggle} disabled={disabled} create={create} />}
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

const ModalFooter = props => {
	const { handleDelete, save, toggle, disabled, create } = props
	return (
		<div style={{ display: "flex", justifyContent: "space-between" }}>
			{!create && (
				<Button
					type="danger"
					style={{ marginLeft: 0 }}
					onClick={handleDelete}
				>
					删除
				</Button>
			)}
			<div style={{ flex: 1 }}>
				<Button onClick={toggle}>取消</Button>
				<Button
					autoFocus
					theme='solid'
					type='primary'
					disabled={disabled}
					onClick={save}
				>
					保存
				</Button>
			</div>
		</div>
	)
}

export default AnchorTypePrinter