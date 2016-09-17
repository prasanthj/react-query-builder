import React from 'react';
import RuleGroup from './RuleGroup';
import uniqueId from './utils/unique-id';
import {error, format, changeType} from './utils/utils';

export default class QueryBuilder extends React.Component {
	static get defaultProps() {
		return {
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
        return {
            is_null: {name: 'is_null', label: 'Is Null', nb_inputs: 0},
            is_not_null: {name: 'is_not_null', label: 'Is Not Null', nb_inputs: 0},
            in: {name: 'in', label: 'In', nb_inputs: 1},
            not_in: {name: 'not_in', label: 'Not In', nb_inputs: 1},
            equal: {name: 'equal', label: '=', nb_inputs: 1},
            not_equal: {name: 'not_equal', label: '!=', nb_inputs: 1},
            less: {name: 'less', label: '<', nb_inputs: 1},
            greater: {name: 'greater', label: '>', nb_inputs: 1},
            less_or_equal: {name: 'less_or_equal', label: '<=', nb_inputs: 1},
            greater_or_equal: {name: 'greater_or_equal', label: '>=', nb_inputs: 1},
        };
    }

    static get sqlOperators() {
        return {
            is_not_null:        {name: 'is_not_null',
                                 op: 'IS NOT NULL',
                                 label: 'is not null',
                                 nb_inputs: 0,
                                 multiple: false,
                                 apply_to: ['string', 'number', 'datetime', 'boolean']},
            is_null:            {name: 'is_null',
                                 op: 'IS NULL',
                                 label: 'is null',
                                 nb_inputs: 0,
                                 multiple: false,
                                 apply_to: ['string', 'number', 'datetime', 'boolean']},
            equal:              {name: 'equal',
                                 op: '= ?',
                                 label: 'equal',
                                 nb_inputs: 1,
                                 multiple: false,
                                 apply_to: ['string', 'number', 'datetime', 'boolean']},
            not_equal:          {name: 'not_equal',
                                 op: '!= ?',
                                 label: 'not equal',
                                 nb_inputs: 1,
                                 multiple: false,
                                 apply_to: ['string', 'number', 'datetime', 'boolean']},
            in:                 {name: 'in',
                                 op: 'IN(?)',
                                 label: 'in',
                                 nb_inputs: 1,
                                 multiple: true,
                                 apply_to: ['string', 'number', 'datetime'],
                                 separator: ','},
            not_in:             {name: 'not_in',
                                 op: 'NOT IN(?)',
                                 label: 'not in',
                                 nb_inputs: 1,
                                 multiple: true,
                                 apply_to: ['string', 'number', 'datetime'],
                                 separator: ','},
            less:               {name: 'less',
                                 op: '< ?',
                                 label: 'less than',
                                 nb_inputs: 1,
                                 multiple: false,
                                 apply_to: ['string', 'number', 'datetime']},
            less_or_equal:      {name: 'less_or_equal',
                                 op: '<= ?',
                                 label: 'less than equal',
                                 nb_inputs: 1,
                                 multiple: false,
                                 apply_to: ['string', 'number', 'datetime']},
            greater:            {name: 'greater',
                                 op: '> ?',
                                 label: 'greater than',
                                 nb_inputs: 1,
                                 multiple: false,
                                 apply_to: ['string', 'number', 'datetime']},
            greater_or_equal:   {name: 'greater_or_equal',
                                 op: '>= ?',
                                 label: 'greater than equal',
                                 nb_inputs: 1,
                                 multiple: false,
                                 apply_to: ['string', 'number', 'datetime']},
            between:            {name: 'between',
                                 op: 'BETWEEN ?',
                                 label: 'between',
                                 nb_inputs: 2,
                                 multiple: true,
                                 apply_to: ['string', 'number', 'datetime'],
                                 separator: ' AND '},
            not_between:        {name: 'not_between',
                                 op: 'NOT BETWEEN ?',
                                 label: 'not between',
                                 nb_inputs: 2,
                                 multiple: true,
                                 apply_to: ['string', 'number', 'datetime'],
                                 separator: ' AND '},
            begins_with:        {name: 'begins_with',
                                 op: 'LIKE(?)',
                                 label: 'begins with',
                                 nb_inputs: 1,
                                 multiple: false,
                                 apply_to: ['string'],
                                 mod: '{0}%'},
            not_begins_with:    {name: 'not_begins_with',
                                 op: 'NOT LIKE(?)',
                                 label: 'not begins with',
                                 nb_inputs: 1,
                                 multiple: false,
                                 apply_to: ['string'],
                                 mod: '{0}%'},
            contains:           {name: 'contains',
                                 op: 'LIKE(?)',
                                 label: 'contains',
                                 nb_inputs: 1,
                                 multiple: false,
                                 apply_to: ['string'],
                                 mod: '%{0}%'},
            not_contains:       {name: 'not_contains',
                                 op: 'NOT LIKE(?)',
                                 label: 'not contains',
                                 nb_inputs: 1,
                                 multiple: false,
                                 apply_to: ['string'],
                                 mod: '%{0}%'},
            ends_with:          {name: 'ends_with',
                                 op: 'LIKE(?)',
                                 label: 'ends with',
                                 nb_inputs: 1,
                                 multiple: false,
                                 apply_to: ['string'],
                                 mod: '%{0}'},
            not_ends_with:      {name: 'not_ends_with',
                                 op: 'NOT LIKE(?)',
                                 label: 'not ends with',
                                 nb_inputs: 1,
                                 multiple: false,
                                 apply_to: ['string'],
                                 mod: '%{0}'},
            is_empty:           {name: 'is_empty',
                                 op: '= \'\'',
                                 label: 'is empty',
                                 nb_inputs: 0,
                                 multiple: false,
                                 apply_to: ['string']},
            is_not_empty:       {name: 'is_not_empty',
                                 op: '!= \'\'',
                                 label: 'is not empty',
                                 nb_inputs: 0,
                                 multiple: false,
                                 apply_to: ['string']},
        };
    }

    static get defaultCombinators() {
        return {
            and: {name: 'and', label: 'AND'},
            or: {name: 'or', label: 'OR'},
        };
    }

    // use this to customize the classnames for html elements
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
            field: Object.keys(fields)[0],
            value: '',
            operator: Object.keys(operators)[0]
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
        if (operators[operator].nb_inputs === 0) {
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
            var ast = rules.map(r=> this._constructQuery(r, {}))
            var sql = this.props.isSQL ? this._getSQL(node, operators): 'SQL is disabled';
            query = {
                combinator,
                rules: ast,
                sql: sql
            };
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
                error('UndefinedSQLCondition', 'Unable to build SQL query with condition "{0}"', data.combinator);
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
                    var sqlOp = operators[rule.operator];
                    if (sqlOp != undefined) {
                        var op = sqlOp.op
                        var sqlStr = '';

                        if (op === undefined) {
                            error('UndefinedSQLOperator', 'Unknown SQL operation for operator "{0}"', rule.operator);
                        }

                        if (sqlOp.nb_inputs !== 0) {
                            var inputValue = rule.value;
                            if (typeof inputValue == 'string') {
                                inputValue = inputValue.toLowerCase().trim();
                                if (sqlOp.multiple && inputValue.includes(sqlOp.separator.toLowerCase())) {
                                    var tokens = inputValue.split(sqlOp.separator.toLowerCase())
                                    inputValue = tokens
                                }
                            }

                            if (!(inputValue instanceof Array)) {
                                inputValue = [inputValue];
                            }

                            inputValue.forEach(function(v, i) {
                                if (i > 0) {
                                    sqlStr+= sqlOp.separator;
                                }

                                if (rule.type == 'integer' || rule.type == 'double' || rule.type == 'boolean') {
                                    v = changeType(v, rule.type, true);
                                }

                                if (sqlOp.mod) {
                                    v = format(sqlOp.mod, v);
                                }

                                if (typeof v == 'string') {
                                    v = '\'' + v + '\'';
                                }

                                sqlStr+= v;
                            });
                        }

                        var stmt = rule.field + ' ' + op.replace(/\?/, sqlStr);
                        // between includes a combinator AND, so wrap it in a parantheses
                        if (stmt.includes('BETWEEN') || stmt.includes('between')) {
                            stmt = '(' + stmt + ')'
                        }
                        parts.push(stmt);
                    }
                }
            });

            return parts.join(' ' + data.combinator + nl);
        }(data));

        return sql;
    }

    static getRulesFromSQL(data) {
        /* operators for SQL -> internal conversion */
        var sqlRuleOperator = {
            '=': function(v) {
                return {
                    val: v,
                    op: v === '' ? 'is_empty' : 'equal'
                };
            },
            '!=': function(v) {
                return {
                    val: v,
                    op: v === '' ? 'is_not_empty' : 'not_equal'
                };
            },
            'LIKE': function(v) {
                if (v.slice(0, 1) == '%' && v.slice(-1) == '%') {
                    return {
                        val: v.slice(1, -1),
                        op: 'contains'
                    };
                }
                else if (v.slice(0, 1) == '%') {
                    return {
                        val: v.slice(1),
                        op: 'ends_with'
                    };
                }
                else if (v.slice(-1) == '%') {
                    return {
                        val: v.slice(0, -1),
                        op: 'begins_with'
                    };
                }
                else {
                    error('SQLParse', 'Invalid value for LIKE operator "{0}"', v);
                }
            },
            'IN':           function(v) { return { val: v, op: 'in' }; },
            'NOT IN':       function(v) { return { val: v, op: 'not_in' }; },
            '<':            function(v) { return { val: v, op: 'less' }; },
            '<=':           function(v) { return { val: v, op: 'less_or_equal' }; },
            '>':            function(v) { return { val: v, op: 'greater' }; },
            '>=':           function(v) { return { val: v, op: 'greater_or_equal' }; },
            'BETWEEN':      function(v) { return { val: v, op: 'between' }; },
            'NOT BETWEEN':  function(v) { return { val: v, op: 'not_between' }; },
            'IS': function(v) {
                if (v !== null) {
                    error('SQLParse', 'Invalid value for IS operator');
                }
                return { val: null, op: 'is_null' };
            },
            'IS NOT': function(v) {
                if (v !== null) {
                    error('SQLParse', 'Invalid value for IS operator');
                }
                return { val: null, op: 'is_not_null' };
            }
        }

        var {lexer, parser} = require('sql-parser-mistic');
        if (parser == undefined) {
            error('MissingLibrary', 'SQLParser is required to parse SQL queries. Get it here https://github.com/mistic100/sql-parser');
        }

        var self = this;

        if (typeof data == 'string') {
            data = { sql: data };
        }

        if (data.sql.toUpperCase().indexOf('SELECT') !== 0) {
            data.sql = 'SELECT * FROM table WHERE ' + data.sql;
        }

        var tokens = lexer.tokenize(data.sql);
        var parsed = parser.parse(tokens)

        if (!parsed.where) {
            error('SQLParse', 'No WHERE clause found');
        }

        var out = {
            combinator: 'and',
            rules: []
        };
        var curr = out;

        (function flatten(data, i) {
            // it's a node
            if (['AND', 'OR'].indexOf(data.operation.toUpperCase()) !== -1) {
                // create a sub-group if the combinator is not the same and it's not the first level
                if (i > 0 && curr.combinator != data.operation.toUpperCase()) {
                    curr.rules.push({
                        combinator: 'and',
                        rules: []
                    });

                    curr = curr.rules[curr.rules.length - 1];
                }

                curr.combinator = data.operation.toUpperCase();
                i++;

                // some magic !
                var next = curr;
                flatten(data.left, i);

                curr = next;
                flatten(data.right, i);
            }
            // it's a leaf
            else {
                if (data.left.value === undefined || data.right.value === undefined) {
                    error('SQLParse', 'Missing field and/or value');
                }

                // check if not plain object
                if (Object.prototype.toString.call(data.right.value) === "[object Object]") {
                    error('SQLParse', 'Value format not supported for {0}.', data.left.value);
                }

                // convert array
                var value;
                if (data.right.value && data.right.value.constructor === Array) {
                    value = data.right.value.map(function(v) {
                        return v.value;
                    });
                }
                else {
                    value = data.right.value;
                }

                // convert operator
                var operator = data.operation.toUpperCase();
                if (operator == '<>') operator = '!=';

                var sqlrl;
                if (operator == 'NOT LIKE') {
                    sqlrl = sqlRuleOperator['LIKE'];
                }
                else {
                    sqlrl = sqlRuleOperator[operator];
                }

                if (sqlrl === undefined) {
                    error('UndefinedSQLOperator', 'Invalid SQL operation "{0}".', data.operation);
                }

                var opVal = sqlrl.call(this, value, data.operation);
                if (operator == 'NOT LIKE') opVal.op = 'not_' + opVal.op;

                var left_value = data.left.values.join('.');

                curr.rules.push({
                    id: uniqueId('r-'),
                    field: left_value,
                    operator: opVal.op,
                    value: opVal.val
                });
            }
        }(parsed.where.conditions, 0));

        return out;
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

        error('UndefinedOperator', 'Undefined operator "{0}"', type);
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