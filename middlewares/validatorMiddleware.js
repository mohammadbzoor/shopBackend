const { validationResult } = require('express-validator');

// @desc  finde the validation errors in this request and wrap them in an object with handy functions
const ValidatorMaddileware = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};


module.exports=ValidatorMaddileware;