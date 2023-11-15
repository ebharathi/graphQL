const mongoose=require('mongoose')
const UserSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        unique:true
    }
})
const fileSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    content:{
        type:String
    }
})

//file schema
const File=mongoose.model('file',fileSchema);
//user schema
const User=mongoose.model('user',UserSchema)
module.exports={User,File};