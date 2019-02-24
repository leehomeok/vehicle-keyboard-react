import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import classnames from 'classnames';
import KeyBoardView from '../KeyBoardView'
import KeyboardEngine from '../engine'
import * as $ from '../utils'
import FastProvince from '../provinces'
import '../keyboard.scss'
import './index.scss'
window.KeyboardEngine = KeyboardEngine
let engine = new KeyboardEngine();
let provinces = new FastProvince();

export default class SingleKeyBoard extends Component {
	componentDidMount() {
	}
	dyKeyCount = () => {
		return $.__arrayOf(this.dyKeyboard, "row0").length;
	}

	dyKeyboard = () => {
		// debugger
		let { args } = this.props
		if (args.inputIndex === 0
			&& $.__orElse(args.provinceName, "").length >= 2
			&& $.__orElse(args.showProvince, true)) {
			var kb = this.updateShortcut();
			if (kb.shortcuts.length > 1) {
				return kb;
			} else {
				return this.updateKeyboard();
			}
		} else {
			return this.updateKeyboard();
		}
	}
	updateShortcut = () => {
		let { args } = this.props
		return {
			shortcuts: provinces.locationOf(args.provinceName).peripheryShortnames().map((name) => {
				return KeyboardEngine.$newKey(name);
			}).slice(0, 6)// 只返回6个快捷键
		}
	}
	updateKeyboard = () => {
		let layout = {};
		let { args, callbacks } = this.props
		const { keyboardType, inputIndex, presetNumber, numberType } = args
		// console.log('keyboardType:', keyboardType)
		const { onmessage, onchanged, oncompleted } = callbacks
		try {
			layout = engine.update(keyboardType? keyboardType: 0, inputIndex, presetNumber, numberType);
		} catch (err) {
			onmessage(err.message);
			return layout;
		}
		// 判断输入车牌是否已完成
		let isCompleted = layout.numberLength === layout.numberLimitLength;
		try {
			try {
				onchanged(layout.presetNumber, isCompleted);
			} finally {
				if (isCompleted) {
					oncompleted(layout.presetNumber, true);
				}
			}
		} finally {
			return layout;
		}
	}

	onClickPadKey = (key) => {
		// debugger
		const { onkeypressed, oncompleted } = this.props.callbacks
		try {
			onkeypressed(key);
		} finally {
			if (key.keyCode === KeyboardEngine.KEY_TYPES.FUN_OK) {
				oncompleted(this.args.presetNumber, false);
			}
		}
	}
	onClickShowALL = () => {
		console.log('showAll')
		this.props.args.showProvince = false
	}
	render() {
		const {callbacks } =this.props
		let keyboard = this.dyKeyboard()
		let kc = this.dyKeyCount()
		return (
			<div id="rid-s-20170810142224">
				<KeyBoardView
					keyboard={keyboard}
					keyCount={kc}
					onPadKeyClick={this.onClickPadKey}
					onPadShowMoreClick={callbacks.onClickShowALL}
				/>
			</div>
		)
	}
}

SingleKeyBoard.propTypes = {
	args: PropTypes.object,
	callbacks: PropTypes.object
}

