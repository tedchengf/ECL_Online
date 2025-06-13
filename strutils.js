// Convert array to comma-separated string
function comma_separated_array(arr) {
    return arr.join(', ');
}

// Convert array to string with custom separator
function string_separated_array(arr, separator) {
    return arr.join(separator);
}

// Quote a string for SQL
function quote(str) {
    if (str === null || str === undefined) {
        return 'NULL';
    }
    return "'" + str.replace(/'/g, "''") + "'";
}

// Get value with default
function val_w_default(val, default_val) {
    return val === undefined ? default_val : val;
}

module.exports = {
    comma_separated_array,
    string_separated_array,
    quote,
    val_w_default
}; 