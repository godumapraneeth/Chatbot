import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    name:{type:String,required:[true,"Please add a name"]},
    email:{type:String,required:[true,"Please add a email"]},
    password:{type:String,required:[true,"Please add a password"],minlength:6}
},{timestamps:true});

export default mongoose.model("User",userSchema);