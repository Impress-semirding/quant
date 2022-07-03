import React from 'react'
import { browserHistory } from 'react-router';
import { useNavigate } from "react-router-dom";
import MonacoEditor from 'react-monaco-editor';
import { Row, Col, Tooltip, Input, Form, Button, notification, message } from 'antd';
import { algorithmSave } from '../../actions/algorithm';
import styles from './index.module.scss';


const formItemLayout = {
	labelCol: {
		xs: { span: 24 },
		sm: { span: 0 },
	},
	wrapperCol: {
		xs: { span: 24 },
		sm: { span: 24 },
	},
};

function AlgorithmEdit() {
	const code1 = "// your original code...";
	const navigate = useNavigate();
	const onFinish = (values: any) => {
		console.log('Success:', values);
		algorithmSave(values)
		message.success("保存策略成功")
		navigate("./algorithm", { replace: true });
	};

	const onMonacoChange = (v) => {
		return v;
	}
	return (
		<div className="container">
			<Form
				{...formItemLayout}
				onFinish={onFinish}
			>
				{/* <div className={styles.tool}> */}
				<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
					<Button type="primary" htmlType="submit">
						Submit
					</Button>
				</Form.Item>
				{/* </div> */}

				<Form.Item
					name="name"
					rules={[{ required: true, message: 'Please input your name!' }]}
				>
					<Input
						placeholder="Algorithm Name"
						defaultValue={name}
					// onChange={this.handleNameChange}
					// initialValue={ }
					/>

				</Form.Item>


				<Form.Item
					name="description"
					rules={[{ required: true, message: 'Please input your description!' }]}
				>
					<Input
						placeholder="Algorithm description"
					// defaultValue={name}
					// initialValue={ }
					/>

				</Form.Item>


				<Form.Item
					name="script"
					rules={[{ required: true, message: 'Please input your description!' }]}
					getValueFromEvent={onMonacoChange}
				>
					<MonacoEditor
						height={600}
						value={code1}
						language="javascript"
						// className="monacoEditor"
						// onChange={this.handleScriptChange}
						theme={"vs-dark"}
						options={{
							selectOnLineNumbers: true,
							roundedSelection: false,
							readOnly: false,
							cursorStyle: "line",
							automaticLayout: false,
						}}
					/>
				</Form.Item>

			</Form>
		</div>
	)
}

export default AlgorithmEdit