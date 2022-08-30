const userModel=require("../models/customerdetails");
const jwt=require("jsonwebtoken");
const auth=async function(req,res,next){
    try{
        const token=req.cookies.jwt;
        const verifyUser=await jwt.verify(token,process.env.SECRETE_KEY);
        req.token=token;
        req.user=verifyUser;
        next();
    }catch(err){
        res.status(404).send(err);
    }
}
module.exports=auth;