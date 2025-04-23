const normalizeField = (value, defaultValue) => {
    if (value === null || value === undefined || value.trim() === "") {
        return defaultValue;
    }
    return value;
};

module.exports = { normalizeField };