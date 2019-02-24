import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import KeyboardEngine from '../engine'
import './index.scss'
window.KeyboardEngine = KeyboardEngine

export default class KeyRowView extends Component {

	deleteTextFilter = (text) => {
		if (!text || "←" === text) {
			return "";
		} else {
			return text;
		}
	}
	handleButtonClick = (ev,obj) => {
		const key = obj.entity;
		const { onKeyClick, onKeyEvent } = this.props
		if (key.enabled || key.keyCode === KeyboardEngine.KEY_TYPES.FUN_DEL) {
			onKeyClick && onKeyClick(key);
			onKeyEvent && onKeyEvent(obj.event|| ev, key);
		}
	}

	render() {
		const { isFunc, rowCount,keys,keyCount } = this.props
		// keyCount = keyCount ? keyCount : keys.length
		// debugger
		// let delText = this.deleteText()
		return (
			<ul 
				className={classnames({
					'funcrow': isFunc === true,
					[`rowsof-${rowCount}`]: true,
					'keyrow': true
				})}>
				{keys && 
					keys.map((key, index) => {
						// console.log(key.text)
						let kCount = keyCount ? keyCount : keys.length
						if (kCount < 9) {
							kCount = 9
						}
						let isDeleteKey = KeyboardEngine.KEY_TYPES.FUN_DEL === key.keyCode
						return (
							<li key={index} className={classnames(['keysof-' + kCount])}>
								<button tag="button" disabled={isDeleteKey ? false : !key.enabled}
									className={classnames([
										[`keycodeof-${key.keyCode}`],
										key.enabled ? '':'disabled',
										['key'],
										['r-border'],
										['txt-key']
									])}
									onClick={(e) => {
										this.handleButtonClick(e,{ entity: key })
									}}
								>
									{ this.deleteTextFilter(key.text)}
								</button>
							</li>
						)
					})
				}
			</ul>
		)
	}
}

KeyRowView.propTypes = {
	rowCount: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.number
	]),
	keys: PropTypes.array,
	isFunc: PropTypes.bool,
	keyCount: PropTypes.oneOfType([
		PropTypes.number,
		PropTypes.string
	]),
	onKeyClick: PropTypes.func,
	onKeyEvent: PropTypes.func,
}
