import React from 'react'
import Mousetrap from 'mousetrap'
import { Modal, Form } from '@douyinfe/semi-ui'
import type { PlasmoCSConfig, PlasmoGetShadowHostId, PlasmoCSUIProps } from "plasmo"
import { useBoolean, MessageActionEnum, formatBookmarkTreeNodes } from '../utils'


export const getShadowHostId: PlasmoGetShadowHostId = () => `easy-bookmark`

export const config: PlasmoCSConfig = {
	run_at: "document_start",
	matches: ["<all_urls>"],
	// all_frames: true
}

const AnchorTypePrinter: React.FC<PlasmoCSUIProps> = (props) => {

	const [visible, setVisible, toggle] = useBoolean(true)
	const [treeNodes, setTreeNodes] = React.useState([])
	console.log('treeNodes: ', treeNodes);

	React.useEffect(() => {
		Mousetrap.bind(['command+s', 'ctrl+s'], function () {
			toggle()
			return false;
		});
	}, [])

	React.useEffect(() => {
		console.log(document.title)
		console.log(location.href)
	}, [])

	React.useEffect(() => {
		chrome.runtime.sendMessage({
			action: MessageActionEnum.GET_BOOK_MARK_TREE
		}, treeNodes => {
			setTreeNodes(formatBookmarkTreeNodes(treeNodes))
		});
	}, [])

	const save = () => {
		toggle()
	}

	return (
		<div>
			<div className="bg-green-800">12</div>
			<Modal
				title="新建书签"
				visible={visible}
				onOk={save}
				onCancel={toggle}
				okButtonProps={{
					autoFocus: true,
				}}
			>
				<Form
					style={{ width: "100%" }}
					layout="vertical"
					labelWidth={70}
					labelAlign="left"
					labelPosition="left"
				>
					<Form.Input field='UserName' label='名称' style={{ width: 300 }} />
					<Form.TreeSelect
						filterTreeNode
						searchAutoFocus
						showSearchClear
						showFilteredOnly
						field='UserName'
						label='文件夹'
						style={{ width: 300 }}
						treeData={treeNodes}
						dropdownMatchSelectWidth={true}
						dropdownStyle={{ maxWidth: 800 }}
					/>
				</Form>
			</Modal>
		</div>
	)
}

export default AnchorTypePrinter