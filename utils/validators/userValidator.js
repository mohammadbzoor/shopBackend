const slugify = require('slugify');
// eslint-disable-next-line import/no-extraneous-dependencies
const bcrypt = require('bcryptjs');
const { check, body } = require('express-validator');
const ValidatorMiddleware = require('../../middlewares/validatorMiddleware');
const UserModel = require('../../models/userModle');


exports.getUserValidator = [
    check('id')
        .isMongoId()
        .withMessage('Invalid user ID Format'),
    ValidatorMiddleware,
];

exports.createUserValidator = [
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

    check('phone')
        .optional()
        .isMobilePhone(["ar-JO"])
        .withMessage('Invalid phone number, must be a valid Jordanian number'),

    check('profileImg')
        .optional(),

    check('role')
        .optional()
        .isIn(['user', 'admin', 'manager'])
        .withMessage('Invalid role value'),

    ValidatorMiddleware,
];

exports.updateUserValidator = [
    check('id')
        .isMongoId()
        .withMessage('Invalid user ID Format'),

    body('name')
        .optional()
        .isLength({ min: 3 })
        .withMessage('User name must be at least 3 characters long')
        .custom((val, { req }) => {
            req.body.slug = slugify(val);
            return true;
        }),

    check('email')
        .optional()
        .isEmail()
        .withMessage('Invalid email address')
        .custom(async (val, { req }) => {
            const user = await UserModel.findOne({ email: val });
            if (user && user._id.toString() !== req.params.id) {
                throw new Error('E-mail already in use');
            }
            return true;
        }),

    check('phone')
        .optional()
        .isMobilePhone(["ar-JO"])
        .withMessage('Invalid phone number, must be a valid Jordanian number'),

    check('role')
        .optional()
        .isIn(['user', 'admin', 'manager'])
        .withMessage('Invalid role value'),

    ValidatorMiddleware,
];

exports.changeUserPasswordValidator = [
    check('id')
        .isMongoId()
        .withMessage('Invalid User id format'),

    check('currentPassword')
        .notEmpty()
        .withMessage('You must enter your current password'),

    check('passwordConfirm')
        .notEmpty()
        .withMessage('You must enter the password confirm'),

    check('password')
        .notEmpty()
        .withMessage('You must enter new password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
        .matches(/^(?=.*[A-Z])(?=.*[0-9])/)
        .withMessage('Password must contain at least one uppercase letter and one number')
        .custom(async (val, { req }) => {
            // 1) Verify current password
            const user = await UserModel.findById(req.params.id);
            if (!user) {
                throw new Error('There is no user for this id');
            }

            const isCorrectPassword = await bcrypt.compare(
                req.body.currentPassword,
                user.password
            );
            if (!isCorrectPassword) {
                throw new Error('Incorrect current password');
            }

            // 2) Verify password confirm matches new password
            if (val !== req.body.passwordConfirm) {
                throw new Error('Password confirmation does not match new password');
            }

            return true;
        }),

    ValidatorMiddleware,
];

exports.deleteUserValidator = [
    check('id')
        .isMongoId()
        .withMessage('Invalid user ID Format'),
    ValidatorMiddleware,
];

exports.updateLoggedUserValidator = [
    body('name')
        .optional()
        .isLength({ min: 3 })
        .withMessage('User name must be at least 3 characters long')
        .custom((val, { req }) => {
            req.body.slug = slugify(val);
            return true;
        }),

    check('email')
        .optional()
        .isEmail()
        .withMessage('Invalid email address')
        .custom(async (val, { req }) => {
            const user = await UserModel.findOne({ email: val });
            if (user && user._id.toString() !== req.params.id) {
                throw new Error('E-mail already in use');
            }
            return true;
        }),

    check('phone')
        .optional()
        .isMobilePhone(["ar-JO"])
        .withMessage('Invalid phone number, must be a valid Jordanian number'),

    ValidatorMiddleware,
];