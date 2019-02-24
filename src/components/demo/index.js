import React, { Component } from 'react';
import SingleKeyBoard from '../SingleKeyBoard'
import * as $ from '../../components/utils'
import KeyboardEngine from '../../components/engine'
import './index.scss'
window.KeyboardEngine = KeyboardEngine
function _indexOf(presetNumber, inputIndex) {
	if (inputIndex === undefined || inputIndex < 0) {
		return presetNumber.length;
	} else {
		return inputIndex;
	}
}
export default class VehicleKeyboard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			args: {
				presetNumber: '',
				keyboardType: 2,
				province: "",
				numberType: 0,
				inputIndex: 0,
				number: "",
				showProvince: true
			}
		}
		this.number = ""
		this.callbacks = {
			_default: {
				native_callback_changed: function (number, isCompleted) { console.info("changed"); },
				native_callback_completed: function (number, isAutoCompleted) { console.info("completed"); },
				native_callback_ontextkey: function (text) {
					//console.info("textkey");
				},
				native_callback_ondelkey: function () {
					//console.info("delkey");
				},
				native_callback_onokkey: function () { console.info("okkey"); },
				native_callback_onrawkey: function (key) {
					// console.info("rawkey");
				},
				native_callback_show_message: function (message) { console.info("message"); }
			},
			platform: () => {
				var isAndroid = (typeof android === "object"); //eslint-disable-line
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
				let plat = this.platform()
				// console.log(plat)
				plat.native_callback_changed(isCompleted, number);
			},
			oncommit: (number, plateMode, isAutoCompleted) => {
				let plat = this.platform()
				console.log(plat)
				plat.native_callback_completed(number, isAutoCompleted);
			},
			onmessage: (message) => {
				let plat = this.platform()
				console.log(plat)
				plat.native_callback_show_message(message);
			},
			onkeypressed: (key) => {
				console.log(key)
				const self = this;
				// let p = this.platform();
				// debugger
				try {
					$.__call(self.native_callback_onrawkey, key);
				} finally {
					if (KeyboardEngine.KEY_TYPES.FUN_DEL === key.keyCode) { // 删除
						$.__call(self.native_callback_ondelkey);
					} else if (KeyboardEngine.KEY_TYPES.FUN_OK === key.keyCode) { //确定
						$.__call(self.native_callback_onokkey);
					} else {
						$.__call(self.native_callback_ontextkey, key.text);
					}
				}
			},
			oncompleted: (number) => {
				console.log(number)
			},
			// 展示全部
			onClickShowALL: () => {
				let { args } = this.state
				this.setState({
					args: Object.assign({}, args, {
						showProvince: false
					})
				})
			}
		}
	}

	UNSAFE_componentWillMount() {
	}
	componentDidMount() {
		this._updateKeyboard({
			presetNumber:this.number,
			keyboardType:0,
			provinceName:"广东省",
			numberType:5,
			inputIndex:-1
		});
	}
	native_callback_ontextkey = (text) => {
		this.number += text;
		let {
			presetNumber,
			keyboardType,
			province,
			numberType,
			inputIndex,
			showProvince,
		} = this.state.args

		console.log("当前车牌[KEY]：" + this.number);
		this._updateKeyboard({
			presetNumber,
			keyboardType,
			provinceName: province,
			numberType,
			inputIndex: inputIndex + 1,
			showProvince,
			number: this.number
		});
	}
	native_callback_ondelkey = () => {
		// debugger
		let len = this.number.length
		if (len<= 0){
			return
		}
		this.number = this.number.substr(0, len-1)

		let { presetNumber, keyboardType, province, numberType, inputIndex, showProvince} = this.state.args //eslint-disable-line
		console.log("当前车牌[DEL]：" + this.number);

		this._updateKeyboard(Object.assign({}, this.state.args, {
			inputIndex: inputIndex - 1,
			number: this.number
		}));
	}
	native_callback_onokkey = () => {
		console.log("当前车牌[OK]");
	}
	native_callback_completed = (number, isAutoCompleted) => {
		console.log("当前车牌[完成]：" + this.number + ", 自动完成:" + isAutoCompleted);
	}
	native_callback_changed = (number, isCompleted) => {
		console.log("当前车牌[变更]：" + this.number + ", 已完成:" + isCompleted);
	}
	native_callback_show_message = (message) => {
		console.log(message);
	}
	// 更新键盘
	_updateKeyboard = ({presetNumber, keyboardType, provinceName = "广东省", numberType, inputIndex}) => {
		try {
			this.setState({
				args: {
					presetNumber,
					keyboardType: Math.max(0, Math.min(2, keyboardType)),
					provinceName,
					showProvince: (provinceName && provinceName.length > 0),
					inputIndex: _indexOf(presetNumber, inputIndex),
					numberType: $.__orElse(numberType, 0)
				}
			})
		} catch (err) {
			console.log(err);
		}
	}

	platform = () => {
		var isAndroid = (typeof android === "object"); //eslint-disable-line
		if (isAndroid) {
			return android;//eslint-disable-line
		} else {
			return typeof window.native_callback_completed === "function" ? window : this.callbacks._default
		}
	}

	render() {
		let { args } = this.state
		return (
			<div id="single-keyboard-box">
				<SingleKeyBoard args={args} callbacks={this.callbacks} />
			</div>
		)
	}
}
