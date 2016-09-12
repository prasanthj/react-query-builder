import React from 'react';
import Rule from './Rule';

export default class RuleGroup extends React.Component {
	static get defaultProps() {
        return {
            id: null,
            parentId: null,
            rules: [],
            combinator: 'and',
            schema: {},
        };
    }

    onCombinatorChange(value) {
        const {onPropChange} = this.props.schema;

        onPropChange('combinator', value, this.props.id);
    }

    addRule(e) {
        e.preventDefault();
        e.stopPropagation();

        const {createRule, onRuleAdd} = this.props.schema;

        const newRule = createRule();
        onRuleAdd(newRule, this.props.id)
    }

    addGroup(e) {
        e.preventDefault();
        e.stopPropagation();

        const {createRuleGroup, onGroupAdd} = this.props.schema;
        const newGroup = createRuleGroup();
        onGroupAdd(newGroup, this.props.id)
    }

    removeGroup(e, groupId) {
        e.preventDefault();
        e.stopPropagation();

        this.props.schema.onGroupRemove(groupId, this.props.parentId);
    }

    render() {
    	const {combinator, rules, schema: {combinators, onRuleRemove, isRuleGroup, classNames}} = this.props;

    	return (
    		<div className={`ruleGroup ${classNames.ruleGroup}`}>
    			<select className={`ruleGroup-combinators ${classNames.combinators}`}
    					value={combinator}
    					onChange={e => this.onCombinatorChange(e.target.value)}>
    					{
                            combinators.map(c=> {
                                return (<option key={c.name} value={c.name}>{c.label}</option>);
                            })
                        }
    			</select>

    			<button className={`ruleGroup-addRule ${classNames.addRule}`}
    					onClick={e => this.addRule(e)}>+Rule</button>
    			<button className={`ruleGroup-addGroup ${classNames.addGroup}`}
    					onClick={e => this.addGroup(e)}>+Group</button>
    			{
    				(this.props.parentId) ?
    					<button className={`ruleGroup-remove ${classNames.removeGroup}`}
    							onClick={e => this.removeGroup(e, this.props.id)}>x</button>
    					: null
    			}
				{
				 	rules.map(r=> {
				     	return (
				         	isRuleGroup(r)
				             	? <RuleGroup key={r.id}
				                        	 id={r.id}
				                         	 schema={this.props.schema}
				                         	 parentId={this.props.id}
				                          	 combinator={r.combinator}
				                          	 rules={r.rules}/>
				             	: <Rule key={r.id}
				                	    id={r.id}
				                    	field={r.field}
				                     	value={r.value}
				                     	operator={r.operator}
				                     	schema={this.props.schema}
				                     	parentId={this.props.id}
				                     	onRuleRemove={onRuleRemove}/>
				     );
				 })
				}
    		</div>
    	);
    }
}