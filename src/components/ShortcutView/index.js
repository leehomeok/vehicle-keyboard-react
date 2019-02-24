import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import './index.scss'

export default class ShortcutView extends Component {
	handleButtonClick = (obj)=> {
		var key = obj.entity;
		if(key.enabled) {
			this.props.onKeyClick && this.props.onKeyClick(key)
		}
	}
	handleShowMoreClick= ()=>{
		this.props.onShowMore && this.props.onShowMore()
	}

	render() {
		const {shortcuts} = this.props
		return (
			<div className="shortcut-view">
				<ul className="shortcut-row">
					{	shortcuts &&
						shortcuts.map((key, index)=> {
							return (
								<li key={index}>
									<button 
                    tag="button"
                    className={classnames(['key', 'txt-key','r-border','shortcut', 'keycodeof-'+key.keyCode])}
                    disabled={!key.enabled}
                    onClick={ ()=> this.handleButtonClick({entity: key}) }
									>
                    { key.text }
                	</button>
								</li>
							)
						})
					}
        </ul>
        <div id="showall" onClick={(e)=> this.handleShowMoreClick(e)}>显示全部</div>
			</div>
		)
	}
}

ShortcutView.propTypes = {
	shortcuts: PropTypes.array,
	onKeyClick: PropTypes.func,
	onShowMore: PropTypes.func,
}
