const jwt=require('jsonwebtoken');


const createToken=(payload)=>{

    const secret = process.env.JWT_SECRET_KEY;
    const expires=process.env.JWT_EXPIRE_TIME;

    return jwt.sign({userId:payload} , secret , {expiresIn:expires})

}
module.exports=createToken;