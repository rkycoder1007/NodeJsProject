const express=require("express");
const mongoose=require("mongoose");
mongoose.connect("mongodb://localhost:27017/Bank").then(()=>{
    console.log("connection successfull");
}).catch((err)=>{
    console.log("connection failed");
});
