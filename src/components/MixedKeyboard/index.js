import React, {Component} from 'react';
import PropTypes from 'prop-types';
import NumberView from '../NumberView'
import KeyBoardView from '../KeyBoardView'
import KeyboardEngine from '../../components/engine'
import * as $ from '../utils'
import FastProvince from '../provinces'
import {_rebuildNumberArray, _isEnergyNumber} from '../utils'
import {deepClone, equal} from '../utils'
import '../keyboard.scss'
import './index.scss'

window.KeyboardEngine = KeyboardEngine
let engine = new KeyboardEngine();
let provinces = new FastProvince();
let _ClickEvent = {
	KEY: 0,
	OK: 1,
	DEL: 2
};
export default class MixedKeyboard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			numberArray: ["", "", "", "", "", "", ""], // 用户输入的车牌数据
			userMode: KeyboardEngine.NUM_TYPES.AUTO_DETECT, // 用户设定的车牌号码模式
			detectNumberType: KeyboardEngine.NUM_TYPES.AUTO_DETECT, // 识别的车牌号码模式
			selectedIndex: 0, // 当前用户输入框已选中的序号
			clickEventType: _ClickEvent.KEY, // 用户动作类型
			showShortcut: true, // 需要显示省份简称
			userChanged: false, //是否外部修改了车牌号码
		};
	}

	componentDidMount() {
	}

	UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
		// console.log(nextProps, nextContext)
		let {numberArray} = this.state
		let {number} = this.props.args //eslint-disable-line
		let newArr = _rebuildNumberArray(nextProps.args.number, numberArray.length)
		let numStr = this.getNumber()
		this.setState(
			{
				numberArray: newArr,
				selectedIndex: Math.max(0, Math.min(numberArray.length - 1, numStr.length)),
				userChanged: true,
				showShortcut: true
			},
			() => {
			}
		)
	}

	shouldComponentUpdate(nextProps, nextState, nextContext) {
		let {changedseed, number} = this.props.args
		let {numberArray, showShortcut} = this.state
		let forceUpdate = (changedseed !== nextProps.args.changedseed)
			|| (!equal(numberArray, nextState.numberArray))
			|| (number !== nextProps.args.number)
			|| (showShortcut !== nextState.showShortcut)
		return forceUpdate
	}

	UNSAFE_componentWillUpdate(nextProps, nextState, nextContext) {
		/*
		let { number} = this.props.args
		number = this.getNumber();
		*/
	}

	// 同步输入框长度
	syncInputLength(mode, isNewEnergyMode) {
		// 键盘引擎根据输入参数，会自动推测出当前车牌的类型。
		// 如果当前用户没有强制设置，更新键盘的输入框长度以适当当前的车牌类型,（指地方武警车牌，长度为8位）
		if (isNewEnergyMode) { // 强制新能源类型，应当设置为：8位
			this.setLengthTo8();
		} else {
			if (KeyboardEngine.NUM_TYPES.WUJING_LOCAL === mode || KeyboardEngine.NUM_TYPES.NEW_ENERGY === mode) { // 地方武警，应当设置为：8位
				this.setLengthTo8();
			} else { // 其它车牌，应当设置为：7位
				this.setLengthTo7();
			}
		}
	}

	// 当用户选择的车牌模式为非AUTO_DETECT模式时，使用用户强制设置模式：目前用户选择的模式有两个值：AUTO_DETECT / NEW_ENERGY
	getUpdateMode() {
		let {userMode} = this.state
		return userMode === KeyboardEngine.NUM_TYPES.NEW_ENERGY ? KeyboardEngine.NUM_TYPES.NEW_ENERGY : KeyboardEngine.NUM_TYPES.AUTO_DETECT
	}

	// 返回当前已输入的车牌号码
	getNumber() {
		let {numberArray} = this.state
		return numberArray.join("");
	}

	// 返回当前车牌是否已输入完成
	isCompleted() {
		let num = this.getNumber()
		return num.length === this.state.numberArray.length;
	}

	// 选中下一个输入序号的输入框
	selectNextIndex() {
		let {selectedIndex, numberArray} = this.state
		let next = selectedIndex + 1;
		if (next <= numberArray.length - 1) {
			this.setState({
				selectedIndex: next
			})
		}
	}

	setNumberTxtAt(index, text) {
		let {numberArray, detectNumberType} = this.state;
		let newArr = deepClone(numberArray);
		newArr[index] = text;

		this.setState(
			{numberArray: newArr},
			() => {
				let isComplete = false;//是否输完车牌号
				if (detectNumberType === 0 || detectNumberType === 1) {//普通车牌
					isComplete = this.getNumber().length === 7;
				} else if (detectNumberType === 5) {//新能源车牌
					isComplete = this.getNumber().length === 8;
				}
				this.props.callbacks.onchanged(this.getNumber(), detectNumberType, isComplete);
			}
		)
		this.resetUserChanged();
	}

	setLengthTo8() {
		let {numberArray, selectedIndex} = this.state
		// 当前长度为7位长度时才允许切换至8位长度
		if (numberArray.length === 7) {
			// 扩展第8位：当前选中第7位，并且第7位已输入有效字符时，自动跳转到第8位
			if (6 === selectedIndex && this.getNumber().length === 7) {
				this.setState({
					selectedIndex: 7
				})
			}
			this.setState({
				numberArray: [...numberArray, ""]
			})
			this.resetUserChanged();
		}
	}

	setLengthTo7() {
		let {numberArray, selectedIndex} = this.state
		if (numberArray.length === 8) {
			if (7 === selectedIndex) { // 处理最后一位的选中状态
				this.setState({
					selectedIndex: 6
				})
			}
			let arr = numberArray.slice(0, 7);
			this.setState({
				numberArray: arr
			})
			this.resetUserChanged();
		}
	}

	// 重置外部用户修改车牌标记位
	resetUserChanged() {
		this.setState({
			userChanged: false
		});
	}

	// computed
	dyKeyCount() {
		let kb = this.dyKeyboard()
		return $.__arrayOf(kb, "row0").length;
	}

	dyDisplayMode() { // 用于显示的车牌模式
		let {userMode, detectNumberType} = this.state
		if (userMode === KeyboardEngine.NUM_TYPES.NEW_ENERGY) {
			return KeyboardEngine.NUM_TYPES.NEW_ENERGY;
		} else {
			return detectNumberType === KeyboardEngine.NUM_TYPES.NEW_ENERGY
				? KeyboardEngine.NUM_TYPES.NEW_ENERGY
				: KeyboardEngine.NUM_TYPES.AUTO_DETECT;
		}
	}

	dyKeyboard() {
		let {province} = this.props.args
		let {showShortcut, selectedIndex} = this.state
		if (0 === selectedIndex  // 选中第一位输入框时；
			&& province.length >= 2 // 当前为有效的省份名字
			&& showShortcut) { // 标记为强制显示快捷省份；
			let keyboard = {
				shortcuts: provinces.locationOf(province).peripheryShortnames().map((name) => {
					return KeyboardEngine.$newKey(name);
				}).slice(0, 6)// 只返回6个
			};
			// 如果快捷省份数据不存在(快捷省份包括当前省份和周边省份数据)，则返回全键盘数据。
			if (keyboard.shortcuts.length > 1) {
				try {
					return keyboard;
				} finally {
					this.submitProvince(keyboard);
				}
			}
		}
		return this.updateKeyboard();
	}

	// methods
	// 切换用户强制车牌模式
	onUserSetMode = () => {
		// debugger
		// 如果当前车牌为武警车牌，不可切换：
		let {userMode, detectNumberType} = this.state
		let {callbacks} = this.props
		if (detectNumberType === KeyboardEngine.NUM_TYPES.WJ2007 || detectNumberType === KeyboardEngine.NUM_TYPES.WJ2012) {
			callbacks.onmessage && callbacks.onmessage("武警车牌，请清空再切换");
			return;
		}
		if (userMode === KeyboardEngine.NUM_TYPES.NEW_ENERGY) {
			this.setState({
				userMode: KeyboardEngine.NUM_TYPES.AUTO_DETECT
			})
		} else {
			// 已输入普通车牌如果不符合新能源车牌方式，不能切换为新能源车牌：
			var number = this.getNumber();
			if (number.length > 2) { // 只输入前两个车牌号码，不参与校验
				let size = 8 - number.length;
				for (let i = 0; i < size; i++) number += "0";
				// 使用正则严格校验补全的车牌号码
				if (_isEnergyNumber(number)) {
					this.setState({
						userMode: KeyboardEngine.NUM_TYPES.NEW_ENERGY
					});
				} else {
					callbacks.onmessage && callbacks.onmessage("非新能源车牌，请清空再切换");
					return;
				}
			} else {
				this.setState({
					userMode: KeyboardEngine.NUM_TYPES.NEW_ENERGY
				});
			}
		}
		// 如果用户切换为新能源模式，则需要修改输入长度为8位：
		if (userMode === KeyboardEngine.NUM_TYPES.NEW_ENERGY) {
			this.setLengthTo7();
			callbacks.onmessage && callbacks.onmessage("车牌类型：普通车牌");
		} else {
			this.setLengthTo8();
			callbacks.onmessage && callbacks.onmessage("车牌类型：新能源车牌");
		}
	}
	// 点击显示更多省份信息：相当于人工点击第一个输入框并强制显示键盘
	onClickShowALL = () => {
		this.onUserSelectedInput(0, true);
		//	this.setState({ showShortcut: false })
	}
	/*
	 * 选中输入框
	 * @param {* index}: index:
	 * @param {* shouldShowKeyboard} 强制显示键盘
	 *
	*/
	onUserSelectedInput = (index, forceShowKeyboard) => {
		//console.log('selectedIndex', index)
		var len = this.getNumber().length;
		// debugger
		if (len > 0 && index <= len) {
			this.setState({
				selectedIndex: index
			})
			this.forceUpdate();
		}
		// console.log('forceShowKeyboard',forceShowKeyboard )
		if (forceShowKeyboard) { /*强制显示键盘*/
			this.setState({
				showShortcut: false
			})
		} else {
			this.setState({
				showShortcut: this.state.selectedIndex === 0
			})
		}
	}
	// 点击键位
	onClickPadKey = (key) => {
		if (key.isFunKey) {
			this.onFuncKeyClick(key);
		} else {
			this.onTextKeyClick(key.text);
		}
	}

	// 点击字符按键盘
	onTextKeyClick(text, forceUpdate) {
		// debugger
		const {numberArray, selectedIndex, detectNumberType} = this.state
		const {callbacks} = this.props
		this.setState({
			clickEventType: _ClickEvent.KEY
		}, () => {
			//callbacks.onchanged(this.getNumber(), detectNumberType, false);
			// console.log("当前车牌[变更]：" + this.getNumber());
		})
		if (forceUpdate || text !== numberArray[selectedIndex]) {
			this.setNumberTxtAt(selectedIndex, text);
		}

		let lastInput = (numberArray.length - 1) === selectedIndex;
		let completed = this.isCompleted();
		let number = this.getNumber();
		let mode = detectNumberType;
		this.selectNextIndex(); // 选中下一个输入框
		try {
			if (completed && String.fromCharCode(31908, 76, 55, 54, 80, 57, 57) === number) {
				// 增加内置触发显示版本信息的处理
				callbacks.onmessage && callbacks.onmessage(VERSION); // eslint-disable-line
			}
		} finally {
			// 当输入最后一位字符并且已输入完成时，自动提交完成接口
			if (lastInput && completed) {
				callbacks.oncommit && callbacks.oncommit(number, mode, true);
			}
		}
	}

	// 点击功能键
	onFuncKeyClick(key) {
		let {numberArray, detectNumberType} = this.state
		let {callbacks} = this.props
		if (key.keyCode === KeyboardEngine.KEY_TYPES.FUN_DEL) {
			this.setState({
				clickEventType: _ClickEvent.DEL
			})
			if (this.state.numberArray.every((num) => num == '')) { //eslint-disable-line
				return
			}

			// 删除车辆号码的最后一位
			let maxIndex = numberArray.length - 1;
			let deleteIndex = Math.max(0, maxIndex);
			for (let i = maxIndex; i >= 0; i--) {
				if (numberArray[i].length !== 0) {
					deleteIndex = i;
					break;
				}
			}
			this.setNumberTxtAt(deleteIndex, "");
			// 更新删除时的选中状态
			this.setState({
				selectedIndex: deleteIndex
			})
		} else if (key.keyCode === KeyboardEngine.KEY_TYPES.FUN_OK) {
			this.setState({
				clickEventType: _ClickEvent.OK
			}, () => {
				// 用户主动点击“确定”按钮，触发回调
				callbacks.oncommit(this.getNumber(), detectNumberType, false);
			})
		}
	}

	// 更新键盘：当WidgetInput上的数据发生变化时，会触发键盘更新
	updateKeyboard() {
		// let { detectNumberType, userMode } = this.state;
		let {keyboardType} = this.props.args
		//debugger
		let number = this.getNumber();
		let updatedKeyboard = engine.update(keyboardType, this.state.selectedIndex, number, this.getUpdateMode());
		this.setState({
			detectNumberType: updatedKeyboard.numberType
		})
		let modeName = KeyboardEngine.NUM_TYPES.nameOf(updatedKeyboard.numberType);
		console.debug("更新键盘数据，车牌: " + number + "，模式：" + modeName + "，车牌限制长度：" + updatedKeyboard.numberLimitLength);
		// 将识别结果的车牌模式同步到用户选择模式上
		let mode = updatedKeyboard.numberType === KeyboardEngine.NUM_TYPES.NEW_ENERGY
			? KeyboardEngine.NUM_TYPES.NEW_ENERGY
			: KeyboardEngine.NUM_TYPES.AUTO_DETECT

		this.setState({
			userMode: mode
		})
		this.syncInputLength(updatedKeyboard.numberType, mode === KeyboardEngine.NUM_TYPES.NEW_ENERGY);
		this.autoCommit(updatedKeyboard);
		return updatedKeyboard;
	}

	// 当键盘数据只有一个键位可选择时,自动提交点击事件:(武警车牌第二位J和使馆车最后一位)
	autoCommit(layout) {
		let {clickEventType} = this.state
		if (clickEventType === _ClickEvent.KEY) {
			let availableKeys = layout.keys.filter((k) => {
				return k.enabled && !k.isFunKey
			});
			if (availableKeys.length === 1) {
				setTimeout(() => {
					this.onTextKeyClick(availableKeys[0].text);
				}, 16);
			}
		}
	}

	// 如果当前为空车牌号码，自动提交第一位快捷省份汉字
	submitProvince(layout) {
		// 注意：如果是用户点击删除按钮，退回到第一位。则不自动提交第一位快捷省份汉字。
		// 注意：如果用户外部重新设置了空的车牌号码，则需要自动提交
		let {clickEventType, userChanged} = this.state
		let number = this.getNumber()
		if (number.length === 0 && (clickEventType === _ClickEvent.KEY || userChanged)) {
			setTimeout(() => {
				if (this.state.selectedIndex === 0) { // 注意检查当自动提交省份时，输入框选中位置是否在第一位上
					this.onTextKeyClick(layout.shortcuts[0].text);
				}
			}, 16);
		}
	}
	
	renderOperate (){
		const {callbacks} = this.props
		return (
			<div className="carriage-affirm">
					<a className="carriage-affirm-cancel" onClick={callbacks.onCancel}>取消</a>
					<a className="carriage-affirm-ok" onClick={callbacks.onConfirm}>确定</a>
				</div>
		)
	}

	render() {
		const {numberArray, selectedIndex, showShortcut} = this.state // eslint-disable-line
		let keyboard = this.dyKeyboard()
		// console.log('kb', keyboard)
		let keyCount = this.dyKeyCount()
		let mode = this.dyDisplayMode()
		return (
			<div id="rid-m-201708101425">
				<NumberView
					numberArray={numberArray}
					mode={mode}
					selectedIndex={selectedIndex}
					onModeChanged={this.onUserSetMode}
					onCellSelected={this.onUserSelectedInput}
				/>
				
				<KeyBoardView
					keyboard={keyboard}
					keyCount={keyCount}
					onPadKeyClick={this.onClickPadKey}
					onPadShowMoreClick={this.onClickShowALL}
				/>
			</div>
		)
	}
}
MixedKeyboard.propTypes = {
	args: PropTypes.oneOfType([
		PropTypes.object,
		PropTypes.array
	]),
	callbacks: PropTypes.object
}
