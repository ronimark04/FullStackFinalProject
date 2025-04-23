const Joi = require("joi");

const loginValidation = (user) => {
    const schema = Joi.object({
        email: Joi.string()
            .ruleset.pattern(
                /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/
            )
            .rule({ message: 'Must be a valid email address' })
            .required(),

        password: Joi.string()
            .ruleset.regex(
                /((?=.*\d{1})(?=.*[A-Z]{1})(?=.*[a-z]{1})(?=.*[!@#$%^&*-]{1}).{7,20})/
            )
            .rule({
                message:
                    'Must be at least 8 characters long and contain an uppercase letter, a lowercase letter, a number and one of the following characters !@#$%^&*-',
            })
            .required(),
    });
    return schema.validate(user);
};

const validateLogin = (user) => {
    const { error } = loginValidation(user);
    if (error) return error.details[0].message;
    return "";
};

module.exports = validateLogin;