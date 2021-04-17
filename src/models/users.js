const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('../models/tasks')
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        lowercase:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Email feild is invalid!");
            }
        }
    },
    age:{
        type:Number,
        validate(value){
            if(value < 1){
                throw new Error("The age cannot be negetive")
            }
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:7,
        validate(value){
            if(value.toLowerCase().includes("password")){
                throw new Error("The password cannot container test password");
            }
        }
    }, 
    tokens:[{
        token:{
            type:String,
            required:true
        }       
    }],
        //this feild is for stroing images in db
    avatar:{
            type:Buffer
        }    
    },
    {
        timestamps:true
    }
)
/*following is the virtual relations ship between the user and task model for mongoose to figure out how these two models are related
    the format: userSchema.virtual("name of field",{
         ref :'ref of the model in relationship',
         localField:'_id', *name of field in user model
         foreignField:'owner' *name used in task model
    })
 */
userSchema.virtual('tasks',{
    ref:'Tasks',
    localField:'_id',
    foreignField:'owner'
})

/* the methods are specific to instance of a user also called as instance methods,
we are using standard methods because we want to access the instance using 'this' 
which we cannot do using arrow function*/
userSchema.methods.generateAuthToken = async function (){

    const user = this
    const token = jwt.sign({ _id:user._id.toString()}, process.env.JWT_SECRET);
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token 
}

userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject();

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject

}


/* the statics are the model methods which are used by models thus called as model methods*/
userSchema.statics.findByCredentials = async (email,password)=>{

    const user = await User.findOne({email})
    if(!user){
        throw new Error("Unable to login")
    }

    const isMatch = await bcrypt.compare(password,user.password);

    if(!isMatch){
        throw new Error("Unable to login");
    }
    return user;
}

/*this is used to check in password was changed or new user was 
 created then following logic will hash the password of user*/
userSchema.pre('save',async function(next){

    const user = this;
    
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
})

userSchema.pre('remove', async function(next){
    const user = this
    await Task.deleteMany({ owner:user._id})
    next()
})

const User = mongoose.model("Users",userSchema);

module.exports = User;