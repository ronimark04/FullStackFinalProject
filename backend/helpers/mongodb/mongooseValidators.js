const URL = {
    type: String,
    trim: true,
    lowercase: true,
    match: RegExp(
        /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/
    )
};

const EMAIL = {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unqiue: true,
    match: RegExp(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/)
};

// const DEFAULT_VALIDATION = {
//     type: String,
//     required: true,
//     minLength: 2,
//     maxLength: 256,
//     trim: true,
//     lowercase: true,
// };

module.exports = { URL, EMAIL };