
/**
 * Throw an Error object with custom name
 * @param type {string}
 * @param message {string}
 * @param args,... {mixed}
 */
export function error (type, message/*, args*/) {
    var err = new Error(format.apply(null, Array.prototype.slice.call(arguments, 1)));
    err.name = type + 'Error';
    err.args = Array.prototype.slice.call(arguments, 2);
    throw err;
};

/**
 * Replaces {0}, {1}, ... in a string
 * @param str {string}
 * @param args,... {mixed}
 * @return {string}
 */
export function format(str/*, args*/) {
    var args = Array.prototype.slice.call(arguments, 1);

    return str.replace(/{([0-9]+)}/g, function(m, i) {
        return args[parseInt(i)];
    });
};

/**
 * Change type of a value to int or float
 * @param value {mixed}
 * @param type {string} 'integer', 'double' or anything else
 * @param boolAsInt {boolean} return 0 or 1 for booleans
 * @return {mixed}
 */
export function changeType(value, type, boolAsInt) {
    switch (type) {
        case 'integer': return parseInt(value);
        case 'double': return parseFloat(value);
        case 'boolean':
            var bool = value.trim().toLowerCase() === 'true' || value.trim() === '1' || value === 1;
            return boolAsInt ? (bool ? 1 : 0) : bool;
        default: return value;
    }
};

/**
 * Escape string like mysql_real_escape_string
 * @param value {string}
 * @return {string}
 */
export function escapeString(value) {
    if (typeof value != 'string') {
        return value;
    }

    return value
      .replace(/[\0\n\r\b\\\'\"]/g, function(s) {
          switch (s) {
              case '\0': return '\\0';
              case '\n': return '\\n';
              case '\r': return '\\r';
              case '\b': return '\\b';
              default:   return '\\' + s;
          }
      })
      // uglify compliant
      .replace(/\t/g, '\\t')
      .replace(/\x1a/g, '\\Z');
};