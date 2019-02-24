import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import './index.scss'

export default class NumberView extends PureComponent {
	handleModeChange = () => {
		// debugger
		this.props.onModeChanged && this.props.onModeChanged()
	}
	handleCellSelected = (index) => {
		this.props.onCellSelected && this.props.onCellSelected(index)
	}

	render() {
		const {  numberArray, selectedIndex } = this.props
		// console.log('numberview:selectedIndex', selectedIndex)
		let mode = numberArray.length === 7 ? '0': '5'
		return (
			<div id="input-widget" className="r-border">
				<div id="mode-switcher"
					onClick={this.handleModeChange }
					className={classnames(['modeof-' + mode])}
				/>
				<ul id="inputrow">
					{numberArray &&
						numberArray.map((text, index) => {
							let selected = index == selectedIndex // eslint-disable-line
							return (
								<li 
									key={index}
									className={classnames([
										'lengthof-' + numberArray.length,
										selected ? 'selected': null,
										'cell'
									])}
								>
									<button className="key" onClick={() => this.handleCellSelected(index)}>
										{text}
									</button>
								</li>
							)
						})
					}
				</ul>
			</div>
		)
	}

}
NumberView.propTypes = {
	numberArray: PropTypes.array,
	mode: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.number
	]),
	onModeChanged: PropTypes.func,
	onCellSelected: PropTypes.func,
	selectedIndex: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.number,
	])
}
