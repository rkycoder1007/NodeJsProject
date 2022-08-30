const express=require("express");
const app=express();
const path=require("path");
const auth=require("./middleware/auth");
const port=process.env.PORT || 3000;
require("dotenv").config();
const cookieParser=require("cookie-parser");
const router=require("./Router/router");
require("./db/conn");

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());
app.use(router);
app.set("view engine","ejs");

//static file
const staticPath=path.join(__dirname,"public");
app.use(express.static(staticPath));

//


app.listen(port,()=>{
    console.log(`listeing ${port}`);
})