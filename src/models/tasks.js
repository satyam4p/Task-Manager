const mongoose = require('mongoose');
const validator = require('validator');

const taskSchema = new mongoose.Schema({
    
    description: {
        type:String,
        required:true,
        trim:true,
        lowercase:true
    },
    completed: {
        type:Boolean,
        default:false        
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref:'Users'/* this feild will help us to create a relashionship between the user and task model
         where task model can access the user model/owner of task with all details */
    }
    },
    {
        timestamps:true
    })

const Task = mongoose.model("Tasks",taskSchema)

module.exports = Task;