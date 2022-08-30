const express=require("express");
const mongoose=require("mongoose");
const validator=require("validator");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:[true,'Provide uniquire email id'],
        Validate(value){
            if(!validator.isEmail(value))
            throw new Error("Invalid Email ID");
        }
    },
    dob:{
        type:Date,
        required:true
    },
    mbno:{
        type:String,
        required:true,
        unique:true,
        minlength:10,
        maxlength:13
    },
    village:{
        type:String,
        required:true
    },
    dist:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    country:{
        type:String,
        required:true
    },
    pincode:{
        type:String,
        required:true
    },
    password:{
        type:String,
        minlength:8,
        required:true
    },
    account:{
        type:Number,
        required:true,
        default:12345678901
    },
    balance:{
        type:Number,
        default:0
    },
    transaction:[{
        type:Number
    }],
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
})

//hashing the password
userSchema.pre("save",async function(next){
    try{
        if(this.isModified("password")){
            const salt=await bcrypt.genSalt(10);
            this.password=await bcrypt.hash(this.password,salt);
        }
        next();
    }catch(err){
        res.send(err);
    }
    
})

//generating token
userSchema.methods.generateToken=async function(){
    try{
        console.log("13");
        const token=await jwt.sign({_id:this._id},process.env.SECRETE_KEY);
        console.log("14");
        this.tokens=this.tokens.concat({token:token});
        await this.save();
        return token;
    }catch(err){
        res.send(err);
    }
}

const userModel=new mongoose.model("Customer",userSchema);
module.exports=userModel;