const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const UserModle = require('../../models/userModle');

exports.addAddressValidator = [
    check('alias')
        .notEmpty()
        .withMessage('Address alias is required')
        .isString()
        .trim()
        .custom(async (value, { req }) => {
            // Check if alias already exists for this user
            const user = await UserModle.findById(req.user._id);
            if (user && user.addresses) {
                const aliasExists = user.addresses.some(addr => addr.alias === value);
                if (aliasExists) {
                    throw new Error(`Address alias "${value}" already exists for this user`);
                }
            }
        }),
    check('details')
        .notEmpty()
        .withMessage('Address details is required')
        .isString()
        .trim()
        .isLength({ min: 5 })
        .withMessage('Address details must be at least 5 characters'),
    check('phone')
        .optional()
        .isMobilePhone(["ar-JO"])
        .withMessage('Invalid phone number, must be a valid Jordanian number'),
    check('city')
        .notEmpty()
        .withMessage('City is required')
        .isString()
        .trim(),
    check('postalCode')
        .notEmpty()
        .withMessage('Postal code is required')
        .isString()
        .trim(),
    check('country')
        .notEmpty()
        .withMessage('Country is required')
        .isString()
        .trim(),
    validatorMiddleware,
];

exports.removeAddressValidator = [
    check('addressId')
        .isMongoId()
        .withMessage('Invalid address ID'),
    validatorMiddleware,
];
