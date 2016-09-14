import React from 'react';
import RuleGroup from './RuleGroup';
import uniqueId from './utils/unique-id';
import Utils from './utils/utils';

export default class QueryBuilder extends React.Component {
	static get defaultProps() {
		return {
			queryJson: null,
			querySql: null,
			fields: [],
			operators: QueryBuilder.defaultOperators,
			combinators: QueryBuilder.defaultCombinators,
			getEditor: null,
			getOperators: null,
			onQueryChange: null,
			controlClassnames: null
		};
	}

	static get propTypes() {
		return {
			queryJson: React.PropTypes.object,
			querySql: React.PropTypes.string,
			fields: React.PropTypes.array.isRequired,
			operators: React.PropTypes.array,
			combinators: React.PropTypes.array,
			getEditor: React.PropTypes.func,
			getOperators: React.PropTypes.func,
			onQueryChange: React.PropTypes.func,
			controlClassnames: React.PropTypes.object
		};
	}

    constructor(...args) {
        super(...args);
        this.state = {
            root: {},
            schema: {},
        };
    }

    componentWillMount() {
        const {fields, operators, combinators, controlClassnames, isSQL} = this.props;
        const classNames = Object.assign({}, QueryBuilder.defaultControlClassnames, controlClassnames);

        this.setState({
            root: this.getInitialQuery(),
            schema: {
                fields,
                operators: isSQL ? QueryBuilder.sqlOperators : QueryBuilder.defaultOperators,
                combinators,

                classNames,

                createRule: this.createRule.bind(this),
                createRuleGroup: this.createRuleGroup.bind(this),
                onRuleAdd: this._notifyQueryChange.bind(this, this.onRuleAdd),
                onGroupAdd: this._notifyQueryChange.bind(this, this.onGroupAdd),
                onRuleRemove: this._notifyQueryChange.bind(this, this.onRuleRemove),
                onGroupRemove: this._notifyQueryChange.bind(this, this.onGroupRemove),
                onPropChange: this._notifyQueryChange.bind(this, this.onPropChange),
                isRuleGroup: this.isRuleGroup.bind(this),
                getEditor: (...args)=>this.prepareEditor(...args),
                getOperators: (...args)=>this.getOperators(...args),
            }
        });

        // trigger unique id generation
        uniqueId();
    }

    componentDidMount() {
        this._notifyQueryChange(null);
    }

	getInitialQuery() {
        return this.props.query || this.createRuleGroup();
    }

	static get defaultOperators() {
        return [
            {name: 'null', label: 'Is Null', nb_inputs: 0},
            {name: 'notNull', label: 'Is Not Null', nb_inputs: 0},
            {name: 'in', label: 'In', nb_inputs: 1},
            {name: 'notIn', label: 'Not In', nb_inputs: 1},
            {name: '=', label: '=', nb_inputs: 1},
            {name: '!=', label: '!=', nb_inputs: 1},
            {name: '<', label: '<', nb_inputs: 1},
            {name: '>', label: '>', nb_inputs: 1},
            {name: '<=', label: '<=', nb_inputs: 1},
            {name: '>=', label: '>=', nb_inputs: 1},
        ];
    }

    static get sqlOperators() {
        return [
            {name: 'equal',              op: '= ?',           label: 'equal',                nb_inputs: 1, multiple: false, apply_to: ['string', 'number', 'datetime', 'boolean']},
            {name: 'not equal',          op: '!= ?',          label: 'not equal',            nb_inputs: 1, multiple: false, apply_to: ['string', 'number', 'datetime', 'boolean']},
            {name: 'in',                 op: 'IN(?)',         label: 'in',                   nb_inputs: 1, multiple: true,  apply_to: ['string', 'number', 'datetime'], separator: ','},
            {name: 'not in',             op: 'NOT IN(?)',     label: 'not in',               nb_inputs: 1, multiple: true,  apply_to: ['string', 'number', 'datetime'], separator: ','},
            {name: 'less than',          op: '< ?',           label: 'less than',            nb_inputs: 1, multiple: false, apply_to: ['string', 'number', 'datetime']},
            {name: 'less than equal',    op: '<= ?',          label: 'less than equal',      nb_inputs: 1, multiple: false, apply_to: ['string', 'number', 'datetime']},
            {name: 'greater than',       op: '> ?',           label: 'greater than',         nb_inputs: 1, multiple: false, apply_to: ['string', 'number', 'datetime']},
            {name: 'greater than equal', op: '>= ?',          label: 'greater than equal',   nb_inputs: 1, multiple: false, apply_to: ['string', 'number', 'datetime']},
            {name: 'between',            op: 'BETWEEN ?',     label: 'between',              nb_inputs: 2, multiple: true,  apply_to: ['string', 'number', 'datetime'], separator: ' AND '},
            {name: 'not between',        op: 'NOT BETWEEN ?', label: 'not between',          nb_inputs: 2, multiple: true,  apply_to: ['string', 'number', 'datetime'], separator: ' AND '},
            {name: 'begins with',        op: 'LIKE(?)',       label: 'begins with',          nb_inputs: 1, multiple: false, apply_to: ['string'], mod: '{0}%'},
            {name: 'not begins with',    op: 'NOT LIKE(?)',   label: 'not begins with',      nb_inputs: 1, multiple: false, apply_to: ['string'], mod: '{0}%'},
            {name: 'contains',           op: 'LIKE(?)',       label: 'contains',             nb_inputs: 1, multiple: false, apply_to: ['string'], mod: '%{0}%'},
            {name: 'not contains',       op: 'NOT LIKE(?)',   label: 'not contains',         nb_inputs: 1, multiple: false, apply_to: ['string'], mod: '%{0}%'},
            {name: 'ends with',          op: 'LIKE(?)',       label: 'ends with',            nb_inputs: 1, multiple: false, apply_to: ['string'], mod: '%{0}'},
            {name: 'not ends with',      op: 'NOT LIKE(?)',   label: 'not ends with',        nb_inputs: 1, multiple: false, apply_to: ['string'], mod: '%{0}'},
            {name: 'is empty',           op: '= \'\'',        label: 'is empty',             nb_inputs: 0, multiple: false, apply_to: ['string']},
            {name: 'is not empty',       op: '!= \'\'',       label: 'is not empty',         nb_inputs: 0, multiple: false, apply_to: ['string']},
            {name: 'is null',            op: 'IS NULL',       label: 'is null',              nb_inputs: 0, multiple: false, apply_to: ['string', 'number', 'datetime', 'boolean']},
            {name: 'is not null',        op: 'IS NOT NULL',   label: 'is not null',          nb_inputs: 0, multiple: false, apply_to: ['string', 'number', 'datetime', 'boolean']},
        ];
    }

    static get defaultCombinators() {
        return [
            {name: 'and', label: 'AND'},
            {name: 'or', label: 'OR'},
        ];
    }

    static get defaultControlClassnames() {
        return {
            queryBuilder: '',

            ruleGroup: '',
            combinators: '',
            addRule: '',
            addGroup: '',
            removeGroup: '',

            rule: '',
            fields: '',
            operators: '',
            value: '',
            removeRule: '',

        };
    }

    isRuleGroup(ruleGroup) {
    	// combinator and rules not null
        return !!(ruleGroup.combinator && ruleGroup.rules);
    }

    createRule() {
        const {fields, operators} = this.state.schema;
        return {
            id: uniqueId('r-'),
            field: fields[0].name,
            value: '',
            operator: operators[0].name
        };
    }

    createRuleGroup() {
        return {
            id: uniqueId('g-'),
            rules: [],
            combinator: this.props.combinators[0].name,
        };
    }

    prepareEditor(config) {
        const {value, operator, onChange} = config;

        const editor = this.props.getEditor && this.props.getEditor(config);
        if (editor) {
            return editor;
        }

        const operators = this.state.schema.operators;
        if (operators.filter(v => v.name === operator)[0].nb_inputs === 0) {
            return null;
        }

        return (
            <input type="text"
                   value={value}
                   onChange={event=>onChange(event.target.value)}/>
        );
    }

    getOperators(field) {
        if (this.props.getOperators) {
            const ops = this.props.getOperators(field);
            if (ops) {
                return ops;
            }
        }

        return this.props.isSQL ? QueryBuilder.sqlOperators : QueryBuilder.defaultOperators;
    }

    onRuleAdd(rule, parentId) {
        const parent = this._findRule(parentId, this.state.root);
        parent.rules.push(rule);

        this.setState({root: this.state.root});
    }

    onGroupAdd(group, parentId) {
        const parent = this._findRule(parentId, this.state.root);
        parent.rules.push(group);

        this.setState({root: this.state.root});
    }

    onPropChange(prop, value, ruleId) {
        const rule = this._findRule(ruleId, this.state.root);
        Object.assign(rule, {[prop]: value});

        this.setState({root: this.state.root});
    }

    onRuleRemove(ruleId, parentId) {
        const parent = this._findRule(parentId, this.state.root);
        const index = parent.rules.findIndex(x=>x.id === ruleId);

        parent.rules.splice(index, 1);
        this.setState({root: this.state.root});
    }

    onGroupRemove(groupId, parentId) {
        const parent = this._findRule(parentId, this.state.root);
        const index = parent.rules.findIndex(x=>x.id === groupId);

        parent.rules.splice(index, 1);
        this.setState({root: this.state.root});
    }

    _findRule(id, parent) {
        const {isRuleGroup} = this.state.schema;

        if (parent.id === id) {
            return parent;
        }

        for (const rule of parent.rules) {
            if (rule.id === id) {
                return rule;
            } else if (isRuleGroup(rule)) {
                const subRule = this._findRule(id, rule);
                if (subRule) {
                    return subRule;
                }
            }
        }

    }

    _notifyQueryChange(fn, ...args) {
        if (fn) {
            fn.call(this, ...args);
        }

        const {onQueryChange} = this.props;
        if (onQueryChange) {
            const query = this._constructQuery(this.state.root);
            onQueryChange(query);
        }
    }

    _constructQuery(node) {
        let query;
        const {isRuleGroup, operators} = this.state.schema;

        if (isRuleGroup(node)) {
            const {combinator, rules} = node;
            query = {
                combinator,
                rules: rules.map(r=> this._constructQuery(r, {}))
            };
            if (this.props.isSQL) {
                this._getSQL(node, operators);
            }
        } else {
            const {field, operator, value} = node;
            query = {field, operator, value};
        }

        return query;
    }

    _getSQL(rules, operators, newline=false) {
        var nl = newline ? '\n' : ' ';
        var data = rules;

        var sql = (function parse(data) {
            if (!data.combinator) {
                data.combinator = 'and';
            }
            if (['AND', 'OR'].indexOf(data.combinator.toUpperCase()) === -1) {
                Utils.error('UndefinedSQLCondition', 'Unable to build SQL query with condition "{0}"', data.combinator);
            }

            if (!data.rules) {
                return '';
            }

            var parts = [];

            data.rules.forEach(function(rule) {
                if (rule.rules && rule.rules.length > 0) {
                    parts.push('(' + nl + parse(rule) + nl + ')' + nl);
                }
                else {
                    var sqlOp = operators.filter(v => v.name === rule.operator)[0];
                    var op = sqlOp.op
                    var inputValue = rule.value.toLowerCase().trim();
                    var sqlStr = '';

                    if (op === undefined) {
                        Utils.error('UndefinedSQLOperator', 'Unknown SQL operation for operator "{0}"', rule.operator);
                    }

                    if (sqlOp.nb_inputs !== 0) {
                        if (sqlOp.multiple && inputValue.includes(sqlOp.separator.toLowerCase())) {
                            var tokens = inputValue.split(sqlOp.separator.toLowerCase())
                            inputValue = tokens
                        }

                        if (!(inputValue instanceof Array)) {
                            inputValue = [inputValue];
                        }

                        inputValue.forEach(function(v, i) {
                            if (i > 0) {
                                sqlStr+= sqlOp.separator;
                            }

                            if (rule.type == 'integer' || rule.type == 'double' || rule.type == 'boolean') {
                                v = Utils.changeType(v, rule.type, true);
                            }

                            if (op.mod) {
                                v = format(op.mod, v);
                            }

                            if (typeof v == 'string') {
                                v = '\'' + v + '\'';
                            }

                            sqlStr+= v;
                        });
                    }

                    parts.push(rule.field + ' ' + op.replace(/\?/, sqlStr));
                }
            });

            return parts.join(' ' + data.combinator + nl);
        }(data));

        console.log(sql)
    }

    _getOperatorByType = function(type) {
        if (type == '-1') {
            return null;
        }

        for (var i = 0, l = this.operators.length; i < l; i++) {
            if (this.operators[i].type == type) {
                return this.operators[i];
            }
        }

        Utils.error('UndefinedOperator', 'Undefined operator "{0}"', type);
    }

    render() {
    	const {root: {id, rules, combinator}, schema} = this.state;

    	return (
        	<div className={`queryBuilder ${schema.classNames.queryBuilder}`}>
            	<RuleGroup rules={rules}
                	combinator={combinator}
                	schema={schema}
                	id={id}
                	parentId={null}/>
        	</div>
    	);

    }
}