import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import classnames from 'classnames';
import * as $ from '../utils'
import ShortcutView from '../ShortcutView'
import KeyRowView from '../KeyRowView'

export default class KeyBoardView extends Component {
	constructor(props) {
		super(props);
		this.state = {
			tipText: "",
			tipPosX: "0px",
			tipPosY: "0px"
		};
	}
	componentDidMount() {
	}

	onKeyEvent = (evt, key) => {
		if (key.enabled && !key.isFunKey) {
			var dom = evt.target;
			// 60px 是tooltip的固定宽度
			// 62px 是tooltip的固定高度 + 间隔
			this.setState({
				tipPosX: `${(dom.offsetLeft - Math.abs(60 - dom.clientWidth) / 4)}px`,
				tipPosY: `${(dom.offsetTop - 62)}px`,
				tipText: key.text
			})
			setTimeout(() => {
				this._reset()
			}, 250);
		} else {
			this._reset()
		}
	}
	_reset = () => {
		this.setState({
			tipText: ""
		})
	}
	// rowCount
	rc = () => {
		return $.__arrayOf(this.props.keyboard, "row4").length === 0 ? 4 : 5;
	}
	shortcuts = () => {
		return $.__arrayOf(this.props.keyboard, "shortcuts")
	}

	hasShortcut = () => {
		let shortcuts = this.shortcuts()
		return shortcuts.length > 0
	}

	handleShowMoreClick = () => {
		const { onPadShowMoreClick } = this.props
		onPadShowMoreClick && onPadShowMoreClick()
	}
	handleKeyClick = (key) => {
		const { onPadKeyClick } = this.props
		onPadKeyClick && onPadKeyClick(key)
	}

	render() {
		const { tipPosX, tipPosY, tipText } = this.state
		const { keyboard, keyCount,showShortcut } = this.props
		let rc = this.rc()

		let hasSc = showShortcut ? showShortcut: this.hasShortcut()
		// debugger
		return (
			<div id="keyboard-pad" >
				{hasSc ?
					<ShortcutView
						shortcuts={this.shortcuts()}
						onKeyClick={this.handleKeyClick}
						onShowMore={this.handleShowMoreClick}
					/>
					:
					<>
						<KeyRowView keys={keyboard.row0} keyCount={keyCount} rowCount={rc}
							onKeyClick={this.handleKeyClick} onKeyEvent={this.onKeyEvent} />

						<KeyRowView keys={keyboard.row1} keyCount={keyCount} rowCount={rc}
							onKeyClick={this.handleKeyClick} onKeyEvent={this.onKeyEvent} />

						<KeyRowView keys={keyboard.row2} keyCount={keyCount} rowCount={rc}
							onKeyClick={this.handleKeyClick} onKeyEvent={this.onKeyEvent} />

						<KeyRowView keys={keyboard.row3} keyCount={keyCount} rowCount={rc}
							onKeyClick={this.handleKeyClick} onKeyEvent={this.onKeyEvent} />

						<KeyRowView keys={keyboard.row4} keyCount={keyCount} rowCount={rc}
							onKeyClick={this.handleKeyClick} onKeyEvent={this.onKeyEvent} />
						{
							tipText &&
							<div id="keytip"
								className="r-border"
								style={{ 'left': tipPosX, 'top': tipPosY }}
							>
								{tipText}
							</div>
						}
					</>
				}
			</div>
		)
	}
}
KeyBoardView.propTypes = {
	keyboard: PropTypes.oneOfType([
		PropTypes.object,
		PropTypes.func
	]),
	keyCount: PropTypes.oneOfType([
		PropTypes.number,
		PropTypes.string
	]),
	onPadKeyClick: PropTypes.func,
	onPadShowMoreClick: PropTypes.func,
	showShortcut: PropTypes.bool
}

