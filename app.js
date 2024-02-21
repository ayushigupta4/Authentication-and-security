const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const encrypt = require('mongoose-encryption');

var app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/secrets");
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});
const secret = "thisisasecret.";
userSchema.plugin(encrypt,{secret: secret, encryptedFields: ["password"]});

const User = mongoose.model('User', userSchema);

app.get('/',function(req,res){
    res.render("home");
});

app.get("/login",function(req,res){
    res.render("login");
});

app.post("/login", async function(req,res){
    const username = req.body.username;
    const password = req.body.password;

    try {
        const user = await User.findOne({email: username});
        if(user.password === password) {
            res.render("secrets");
        } else {
            res.send("Password does not match");
        }
    } catch(error) {
        console.error("Error while login: ", error);
    }

});

app.get("/register", function(req,res){
    res.render("register");
});

app.post("/register", async function(req,res){
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });
    try {
        await newUser.save();
        res.render("secrets");
    } catch(error) {
        console.error("Error while saving: ", error);
        res.status(500).send("Error while registering");
    }
});

app.listen(5000, function(){
    console.log("Server started");
});