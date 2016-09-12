import React from 'react';

export default class Rule extends React.Component {
	static get defaultProps() {
		return {
			id: null,
			parentId: null,
			field: null,
			operator: null,
			value: null,
			schema: null
		};
	}

	onValueChanged(field, value) {
		const {id, schema: {onPropChange}} = this.props;
		onPropChange(field, value, id);
	}

	removeRule(e) {
		e.preventDefault();
		e.stopPropagation();
		this.props.schema.onRuleRemove(this.props.id, this.props.parentId);
	}

	render() {
		const {field, operator, value, schema: {fields, getEditor, getOperators, classNames}} = this.props;
		return (
			<div className={`rule ${classNames.rule}`}>
				<select className={`rule-fields ${classNames.fields}`}
						value={field}
						onChange={e => this.onValueChanged('field', e.target.value)}>
				        {
                        	fields.map(field=> {
                                return (
                                    <option key={field.name} value={field.name}>{field.label}</option>
                                );
                            })
                        }
				</select>
				<select className={`rule-operators ${classNames.operators}`}
						value={operator}
						onChange={e => this.onValueChanged('operator', e.target.value)}>
						{
                            getOperators(field).map(op=> {
                                return (
                                    <option value={op.name} key={op.name}>{op.label}</option>
                                );
                            })
                        }
				</select>
				{
					getEditor({
						field,
						value,
						operator,
						onChange: v => this.onValueChanged('value', v)
					})
				}

				<button className={`rule-remove ${classNames.removeRule}`}
						onClick={e => this.removeRule(e)}>x</button>
			</div>
		);
	}
}