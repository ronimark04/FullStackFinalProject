const Joi = require('joi');

const updateValidation = (user) => {
    const schema = Joi.object({
        username: Joi.string()
            .min(3)
            .max(15)
            .required(),
        email: Joi.string()
            .ruleset.pattern(
                /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/
            )
            .rule({ message: 'Must be a valid email address' })
            .required(),
        password: Joi.string()
            .regex(
                /((?=.*\d{1})(?=.*[A-Z]{1})(?=.*[a-z]{1})(?=.*[!@#$%^&*-]{1}).{7,20})/
            ).message({
                message:
                    'Must be at least 8 characters long and contain an uppercase letter, a lowercase letter, a number and one of the following characters !@#$%^&*-',
            })
            .required(),
        isAdmin: Joi.boolean().allow(""),
    });
    return schema.validate(user);
};

const validateUpdate = (user) => {
    const { error } = updateValidation(user);
    if (error) return error.details[0].message;
    return "";
};

module.exports = validateUpdate;