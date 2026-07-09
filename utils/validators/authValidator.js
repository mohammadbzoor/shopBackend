const slugify = require('slugify');
// eslint-disable-next-line import/no-extraneous-dependencies
const { check } = require('express-validator');
const ValidatorMiddleware = require('../../middlewares/validatorMiddleware');
const UserModel = require('../../models/userModle');


exports.signupValidator = [
    check("name")
        .notEmpty()
        .withMessage('User name is required')
        .isLength({ min: 3 })
        .withMessage('User name must be at least 3 characters long')
        .custom((val, { req }) => {
            req.body.slug = slugify(val);
            return true;
        }),

    check('email')
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email address')
        .custom(async (val) => {
            const user = await UserModel.findOne({ email: val });
            if (user) {
                throw new Error('E-mail already in use');
            }
            return true;
        }),

    check('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
        .matches(/^(?=.*[A-Z])(?=.*[0-9])/)
        .withMessage('Password must contain at least one uppercase letter and one number')
        .custom((password, { req }) => {
            if (password !== req.body.passwordConfirm) {
                throw new Error('Password Confirmation Incorrect');
            }
            return true;
        }),

    check('passwordConfirm')
        .notEmpty()
        .withMessage('Password Confirmation Required'),


    ValidatorMiddleware,
];

exports.loginValidator = [
    check('email')
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email address'),

    check('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),

    ValidatorMiddleware,
];
