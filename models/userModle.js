
const mongoose=require('mongoose');
// eslint-disable-next-line import/no-extraneous-dependencies
const bcrypt=require('bcryptjs');

const userSchema=new mongoose.Schema(
    {
        name:{
            type:String,
            trim:true,
            required:[true,'name requored'],
        },
        slug:{
            type:String,
            lowercase:true,
        },
        email:{
            type:String,
            unique:true,
            required:[true,'email requored'],
            lowercase:true,
        },
        phone:String,
        profilleImg:String,
        password:{
            type:String,
            required:[true,'password required'],
            minlength:[6,'Too short password'],
        },
        passwordCangedAt:Date,
        role:{
            type:String,
            enum:['user','admin','manager'],
            default:'user',
        },
        passwordResetCode:String,
        passwordResetExpires:Date,
        passwordResetVerified:Boolean,
        active:{
            type:Boolean,
            default:true,
        },
        // child reference (one to many relationship)
        whishlist:[
            {
                type:mongoose.Schema.ObjectId,
                ref:'Product',
            }
        ],
        addresses:[
            {
                id:{type:mongoose.Schema.Types.ObjectId},
                alias:String,
                details:String,
                phone:String,
                city:String,
                postalCode:String,
                country:String,
            }
        ]
    },{timestamps:true}
)

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    // Hashing user password
    this.password = await bcrypt.hash(this.password, 12);
})


const UserModle=mongoose.model('User',userSchema);
module.exports=UserModle;