import mongoose from 'mongoose';

const MessageSchema=new mongoose.Schema({
    role:{
        type:String,
        enum:["user","assistant"],
        required:true
    },

    content:{
        type:String,
        required:true
    },

    timestamp:{
        type:Date,
        default:Date.now
    } 
})

const ThreadSchema=new mongoose.Schema({
    threadID:{
        type:String,
        required:true,
        unique:true
    },
    title:{
        type:String,
        default:"New Chat"
    }, 
    messages:[MessageSchema],
    createdAT:{
        type:Date,
        default:Date.now
    },
    updatedAT:{
        type:Date,
        default:Date.now
    }
})

export default mongoose.model("Thread",ThreadSchema);