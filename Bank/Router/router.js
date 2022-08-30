const express=require("express");
const router=new express.Router();
const bcrypt=require("bcryptjs");
const auth=require("../middleware/auth");
const userModel=require("../models/customerdetails");

//new user registration
router.get("/register",(req,res)=>{
    res.render("register");
})

router.post("/register",async(req,res)=>{
    try{
        const password=req.body.password;
        const cpassword=req.body.cpassword;
        if(password===cpassword){
            const email=req.body.email;
            const userFind=await userModel.findOne({email:email});
            if(!userFind){
                const mbno=req.body.mbno;
                const userMobile=await userModel.findOne({mbno:mbno});
                if(userMobile){
                    res.status(404).send({"status":"failed","message":`${mbno} already registered`}); 
                }
                else{
                    let account;
                while(true){
                    account=Math.random()*10+Math.random()*100+Math.random()*1000+Math.random()*10000+Math.random()*100000+
                Math.random()*1000000+Math.random()*10000000+Math.random()*100000000+Math.random()*1000000000+
                Math.random()*10000000000+Math.random()*100000000000;
                account=parseInt(account);
                const userAccount=await userModel.findOne({account:account});
                if(userAccount){ continue;}else{break;}
                }
                const doc=new userModel({
                    name:req.body.name,
                    email:req.body.email,
                    dob:req.body.dob,
                    mbno:req.body.mbno,
                    village:req.body.village,
                    dist:req.body.dist,
                    state:req.body.state,
                    country:req.body.country,
                    pincode:req.body.pincode,
                    account:account,
                    password:req.body.password
                })
                const token=await doc.generateToken();
                const cookieResult=await res.cookie("jwt",token,{expiresIn:"5m"});
                const result=await doc.save();
                res.render("registrationsuccess",{records:result});
                }
                
            }else{
                res.status(404).send({"status":"failed","message":`${email} already registered`});  
            }
        }else{
            res.status(404).send({"status":"failed","message":`Password does not match`}); 
        }

    }catch(err){
        res.status(404).send({"status":"failed","message":`Registration failed ${err}`});
    }
})

//login the user
router.post("/login",async (req,res)=>{
    try{
        const password=req.body.password;
        const email=req.body.email;
        const userDetails=await userModel.findOne({email:email});
        if(userDetails){
            const isMatch=await bcrypt.compare(password,userDetails.password);
            if(isMatch){
                const token=await userDetails.generateToken();
                const result=res.cookie("jwt",token,{maxAge:600000});
                res.render("login",{records:userDetails});
            }else{
                res.status(404).send({"status":"failed","message":`Invalid pass Login Details`}); 
            }
        }else{
            res.status(404).send({"status":"failed","message":`Invalid email Login Details`}); 
        }
    }catch(err){
        res.status(404).send({"status":"failed","message":`Server Down Try after sometime`});  
    }
})
router.get("/login",(req,res)=>{
    res.render("login");
})

//sign out
router.get("/signout",auth,async (req,res)=>{
    try{
        const id=req.user._id;
        const userDetails=await userModel.findById({_id:id});
        // userDetails.tokens=userDetails.tokens.filter((value)=>{
        //     return value.token!==req.token;
        // })

        //logout from all devices
        userDetails.tokens=[];
        const result=res.clearCookie("jwt");
        await userDetails.save();
        res.render("home");
    }catch(err){
        res.status(404).send(err);
    }
   
})

//password reset forgot password
router.get("/forgotpassword",(req,res)=>{
    res.render("forgotpassword");
})

router.post("/forgotpassword",async (req,res)=>{
    try{
        const password=req.body.password;
        const email=req.body.email;
        const cpassword=req.body.cpassword
        const userDetails=await userModel.findOne({email:email});
        if(userDetails){
            if(password===cpassword){
                const hashpassword=await bcrypt.hash(password,10);
                const result=await userModel.findByIdAndUpdate({_id:userDetails._id},{$set:{password:hashpassword}});
                res.send('password reset successfully');
            }else{
                res.status(404).send({"status":"failed","message":`Password does not match`});   
            }
            
        }else{
            res.status(404).send({"status":"failed","message":`Invalid Email ID`}); 
        }
    }catch(err){
        res.status(404).send({"status":"failed","message":`Server Down Try after sometime`});  
    }
})

//account summary
router.get("/accountsummary",auth,async (req,res)=>{
    const id=req.user._id;
    const userDetails=await userModel.findById({_id:id});
    const date=userDetails.dob.getDate();
    let m=userDetails.dob.getMonth();
    let month=["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","NOV","DEC"];
    month=month[m];
    const year=userDetails.dob.getFullYear();
    res.render("accountsummary",{records:userDetails,date:date,month:month,year:year});
})

//dashboard
router.get("/dashboard",auth,async (req,res)=>{
    try{
        const id=req.user._id;
         const userDetails=await userModel.findById({_id:id});
        res.render("login",{records:userDetails});
    }catch(err){
        res.status(404).send({"message":"Session Time Out!\nLog In Again"});
    }
})

//change password
router.get("/changepassword",auth,async (req,res)=>{
    try{
        const id=req.user._id;
         const userDetails=await userModel.findById({_id:id});
        res.render("changepassword",{records:userDetails});
    }catch(err){
        res.status(404).send({"message":"Session Time Out!\nLog In Again"});
    }
})
router.post("/changepassword",auth,async (req,res)=>{
    try{
        console.log("1");
       const email=req.body.email;
       console.log("2");
       const userFind=await userModel.findOne({email:email});
       console.log("3");
       if(userFind){
        console.log("4");
            const currentpassword=req.body.currentpassword;
            console.log("5"+currentpassword);
            const systempassword=userFind.password;
            console.log("6");
            const isMatch=await bcrypt.compare(currentpassword,userFind.password);
            console.log("7");
            if(isMatch){
                console.log("8");
                const password=req.body.newpassword;
                const cpassword=req.body.cpassword;
                console.log("9");
                if(password===cpassword){
                    console.log("10");
                    const hashpassword=await bcrypt.hash(password,10);
                    console.log("11");
                        const result=await userModel.findByIdAndUpdate({_id:userFind._id},{$set:{password:hashpassword}});
                        console.log("12");
                        res.render('passwordchangesuccess',{records:userFind});
                }else{
                    res.status(404).send({"message":"Password does not match"});
                }
            }else{
                res.status(404).send({"message":"Current password is invalid"});
            }
       }else{
        res.status(404).send({"message":"Invalid Email ID"});
       }
    }catch(err){
        res.status(404).send({"message":"Session Time Out!\nLog In Again"+err});
    }
})

//cash withdraw
router.get("/cashwithdraw",auth,async (req,res)=>{
    try{
        const id=req.user._id;
         const userDetails=await userModel.findById({_id:id});
        res.render("cashwithdraw",{records:userDetails});
    }catch(err){
        res.status(404).send({"message":"Session Time Out!\nLog In Again"});
    }
})

router.post("/cashwithdraw",auth,async (req,res)=>{
    try{
        const account=req.body.account;
        const caccount=req.body.caccount;
        if(account===caccount){
            let user=await userModel.findOne({account:account});
            if(user){
                const amount=req.body.amount;
                const camount=req.body.camount;
                if(amount===camount){
                   const withdrawamount=parseInt(amount);
                   let balance=user.balance;
                   if(balance<withdrawamount){
                    res.status(404).send({"status":"failed","message":"Insufficient Balance"});
                   }else{
                        balance-=withdrawamount;
                        const result=await userModel.findByIdAndUpdate({_id:user._id},{$set:{balance:balance}},{new:true});
                        user=await userModel.findOne({account:account});
                        let withd=-withdrawamount;
                        const rest=await userModel.updateOne({account:account},{$push:{transaction:withd}});
                        res.render("withdrawsuccess",{records:user,amount:withdrawamount});
                   }
                }else{
                    res.status(404).send({"status":"failed","message":"Amount does not match"});
                }

            }else{
                res.status(404).send({"status":"failed","message":"Invalid account number"});
            }
        }else{
            res.send("account number does not match");
        }
    }catch(err){
        res.status(404).send({"message":"Session Time Out!\nLog In Again"}); 
    }
})


//cash deposite
router.get("/cashdeposite",auth,async (req,res)=>{
    try{
        const id=req.user._id;
         const userDetails=await userModel.findById({_id:id});
        res.render("cashdeposite",{records:userDetails});
    }catch(err){
        res.status(404).send({"message":"Session Time Out!\nLog In Again"});
    }
})

router.post("/cashdeposite",auth,async (req,res)=>{
    try{
        const account=req.body.account;
        const caccount=req.body.caccount;
        if(account===caccount){
            let user=await userModel.findOne({account:account});
            if(user){
                const amount=req.body.amount;
                const camount=req.body.camount;
                if(amount===camount){
                   const depositeamount=parseInt(amount);
                   let balance=user.balance;
                        balance+=depositeamount;
                        const result=await userModel.findByIdAndUpdate({_id:user._id},{$set:{balance:balance}},{new:true});
                        
                        console.log("3");
                        const rest=await userModel.updateOne({account:account},{$push:{transaction:amount}});
                        console.log("4");
                        user=await userModel.findOne({account:account});
                        res.render("depositesuccess",{records:user,amount:depositeamount});
                }else{
                    res.status(404).send({"status":"failed","message":"Amount does not match"});
                }

            }else{
                res.status(404).send({"status":"failed","message":"Invalid account number"});
            }
        }else{
            res.send("account number does not match");
        }
    }catch(err){
        console.log("5");
        res.status(404).send({"message":"Session Time Out!\nLog In Again"+err}); 
    }
})

router.get("/",(req,res)=>{
    res.render("home");
})
module.exports=router;