const express = require('express');
const app = express();
const userModel = require("./models/user");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const user = require('./models/user');

app.set("view engine", "ejs");
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname,"public")));
app.use(express.static(path.join(__dirname,"assets")));


app.get('/',function(req,res){
  res.render("befLogin.ejs");
})

app.get('/login',function(req,res){
    res.render("index.ejs");
})

app.get('/logout',(req,res)=>{
    let token = jwt.sign({email: user.email},"secret");
    res.cookie("token","");
    res.redirect('/');
})

app.get('/profile',async function(req,res){
    const user = await userModel.findOne({email: req.body.email});
    res.render("profile.ejs",({user:user, email:user.email, name:user.name}));
})

app.get('/lectures', async function(req,res){
    res.render("lectures.ejs");
})

app.post('/create',function(req,res){
    let{name,email,password} = req.body;
    bcrypt.genSalt(15,(err,salt)=>{
        bcrypt.hash(password,salt, async (err,hash)=>{
            let createdUser = await userModel.create({
                name,
                email,
                password:hash
            })
            let token = jwt.sign({email},"secret"); //here secret is the secret key
            res.cookie("token",token); 
            res.redirect('/login');
            console.log(token);
        })
    })
})

app.post('/login',async function(req,res){
    let user = await userModel.findOne({email: req.body.email});
    if(!user) res.send("First create an account on Sign In Page");
    bcrypt.compare(req.body.password,user.password,function(err,result){
        if(result){
            let token = jwt.sign({email: user.email},"secret"); //here secret is the secret key
            res.cookie("token",token); 
            res.redirect("/profile");
        }
        else{
            res.redirect("/login");
        }
    })
})

app.post('/profile',async function(req,res){
    const user = await userModel.findOne({email: req.body.email});
    res.render('profile.ejs',({user:user}));
})

app.listen(3000, (err)=>{
    console.log("Running the app..");
})
