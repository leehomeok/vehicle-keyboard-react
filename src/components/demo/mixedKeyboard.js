import React, {Component} from 'react';
import MixedKeyboard from '../../components/MixedKeyboard'
import * as $ from '../../components/utils'
import KeyboardEngine from '../../components/engine'
import './index.scss'

window.KeyboardEngine = KeyboardEngine

export default class CarKeyboard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			args: {
				changedseed: +new Date(),
				number: "粤B12345",
				province: "",
				keyboardType: 0,
				showProvince: true
			}
		};


		this.callbacks = {
			_default: {
				native_callback_changed(isCompleted, number) {
					console.log("[无回调] 输入车牌号码（输入中），当前车牌：" + number);
				},
				native_callback_completed(number, isAutoCompleted) {
					console.log("[无回调] 输入车牌号码（已完成），当前车牌：" + number + "，自动完成：" + isAutoCompleted);
				},
				native_callback_show_message(message) {
					console.log("[无回调] 提示消息：" + message);
				}
			},
			platform: () => {
				let isAndroid = (typeof android === "object"); //eslint-disable-line
				if (isAndroid) {
					return android;//eslint-disable-line
				} else {
					if ($.__isFun([
						window.native_callback_changed,
						window.native_callback_completed,
						window.native_callback_show_message,
						window.native_callback_ontextkey,
						window.native_callback_ondelkey,
						window.native_callback_onokkey,
						window.native_callback_onrawkey
					])) {
						return window;
					} else {
						return this._default;
					}
				}
			},

			onchanged: (number, plateMode, isCompleted) => {
				console.log(number,plateMode, isCompleted)
				this.native_callback_changed(number, isCompleted);
			},
			oncommit: (number, plateMode, isAutoCompleted) => {
				this.native_callback_completed(number, isAutoCompleted);
			},
			onmessage: (message) => {
				this.native_callback_show_message(message);
			},
			onkeypressed: (key) => {
				console.log(key)
				let self = this
				// let p = this.platform();
				try {
					$.__call(self.native_callback_onrawkey, key);
				} finally {
					if (KeyboardEngine.KEY_TYPES.FUN_DEL === key.keyCode) {
						$.__call(self.native_callback_ondelkey);
					} else if (KeyboardEngine.KEY_TYPES.FUN_OK === key.keyCode) {
						$.__call(self.native_callback_onokkey);
					} else {
						$.__call(self.native_callback_ontextkey, key.text);
					}
				}
			},
			onshowmessage: (msg) => {
				this.native_callback_show_message(msg);
			},
			onClickShowALL: () => {
				let {args} = this.state
				this.setState({
					args: Object.assign({}, args, {
						showProvince: false
					})
				})
			}
		}
	}

	componentDidMount() {
		//debugger
		this._updateKeyboard({number: '粤B12345', keyboardType: 0, province: ''});
	}

	native_callback_ontextkey(text) {
		let {
			number,
			keyboardType,
			province
		} = this.state.args
		number += text;
		console.log("当前车牌[KEY]：" + number);
		this._updateKeyboard({
			number,
			keyboardType,
			province
		});
	}

	native_callback_ondelkey() {
		let {number} = this.state.args
		console.log("当前车牌[DEL]：" + number);
		this._updateKeyboard();
	}

	native_callback_onokkey() {
		console.log("当前车牌[OK]");
	}

	native_callback_completed(number, isAutoCompleted) {
		console.log("当前车牌[完成]：" + number + ", 自动完成:" + isAutoCompleted);
	}

	native_callback_changed(number, isCompleted) {
		//console.log("当前车牌[变更]：" + number + ", 已完成:" + isCompleted);
	}

	native_callback_show_message(message) {
		console.info(message, 10)
	}


	_updateKeyboard = ({number, keyboardType, province, showProvince}) => {
		// 默认车牌键盘类型为2
		keyboardType = keyboardType ? keyboardType : 0;
		console.log("收到更新键盘布局请求，车牌：" + number + "，键盘类型：" + keyboardType + ", 省份：" + province);
		if (this._invalidType(number, "string", "初始化参数(number)必须是字符串！")) return;
		if (this._invalidType(keyboardType, "number", "初始化参数(keyboardType)必须是整数！")) return;
		if (this._invalidType(province, "string", "初始化参数(province)必须是字符串！")) return;
		try {
			this.setState({
				args: {
					changedseed: +new Date(), // 强制更新组件
					province: province.trim(),
					keyboardType: Math.max(0, Math.min(2, keyboardType)),
					number: number.trim().toUpperCase(),
					showProvince
				}
			})
		} catch (err) {
			console.log(err);
		}
	}


	_invalidType(obj, type, msg) {
		if (typeof obj !== type) {
			this.callbacks.onshowmessage(msg);
			console.log(msg);
			return true;
		} else {
			return false;
		}
	}

	render() {
		const {args} = this.state
		return (
			<div id="mixed-keyboard-box">
				<MixedKeyboard args={args} callbacks={this.callbacks}/>
			</div>
		)
	}
}

