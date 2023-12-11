const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const transporter=require('../config/email.js');

const userRegister=async(req,res)=>{
    const {name,email,password,password_confirmation,tc}=req.body;
    const user=await User.findOne({email});
    if(user){
        return res.status(400).json({message:'Email already exists'});
    }
    else{
        if(name && email && password && password_confirmation && tc){
            if(password===password_confirmation){
                const salt=await bcrypt.genSalt(10);
                const hashedPassword=await bcrypt.hash(password,salt);
                const user=new User({
                    name,
                    email,
                    password:hashedPassword,
                    tc
                });
                await user.save();
                const save_user=await User.findOne({email});
                const token = jwt.sign({ id: save_user._id }, process.env.JWT_SECRET, {expiresIn:'5d'});
                res.cookie('token',token).status(200).json({message:'User created successfully'});
            }
            else{
                res.status(400).json({message:'Passwords do not match'});
            }
        }else{
            res.status(400).json({message:'All fields are required'});
        }
    }
}

const userLogin=async(req,res)=>{
    const {email,password}=req.body;
    if(email && password){
        const user=await User.findOne({email});
        if(user!=null){
            const isMatch=await bcrypt.compare(password,user.password);
            if(isMatch&& (user.email===email)){
                //create token
                const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {expiresIn:'5d'});
                res.cookie('token',token).status(200).json({message:'User logged in successfully'});
            }
            else{
                res.status(400).json({message:'Invalid credentials'});
            }
        
        }
        else{
            res.status(400).json({message:'Invalid credentials'});
        }
    }
    else{
        res.status(400).json({message:'All fields are required'});
    }
    
    
}

const changePassword=async(req,res)=>{  
    const {password,password_confirmation}=req.body;
    if(password && password_confirmation){
        if(password!==password_confirmation){
            res.status(400).json({message:'Passwords do not match'});
        }
        else{
           const salt=await bcrypt.genSalt(10);
           const hashedPassword=await bcrypt.hash(password,salt);
           await User.findByIdAndUpdate(req.user._id,{$set:{password:hashedPassword}});
           res.send({"status":"success","message":"Password changed successfully"})
            
        
        }
    }
    else{
        res.status(400).json({message:'All fields are required'});
    }

}

const loggedUser=async(req,res)=>{
   res.send(req.user);

}

const sendUserpasswordResetEmial=async(req,res)=>{
    const {email}=req.body;
    if(email){
        const user=await User.findOne({email});
        const secret=user._id + process.env.JWT_SECRET;
        if(user!=null){
            //send email
            const token = jwt.sign({ userId: user._id }, secret, {expiresIn:'15m'});
            const link=`http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`
            //send email
            let info = await transporter.sendMail({
                from: process.env.EMAIL_HOST_USER, // sender address
                to: user.email,
                subject: "Hello ji Your 🔥 Password reset request",
                html:`<a href="${link}">Click here to reset your password</a>`

            })
            res.status(200).send({message:'Password reset email sent',info});
        }
        else{
            res.status(400).json({message:'Email does not exist'});
        }
    }
    else{
        res.status(400).json({message:'Email is required'});
    }

}

const resetPassword=async(req,res)=>{
    const {password,password_confirmation}=req.body;
    const {id,token}=req.params;
    const user=await User.findById(id);
    const new_secret=user._id + process.env.JWT_SECRET;
    try{
        jwt.verify(token,new_secret);
        if(password && password_confirmation){
            if(password===password_confirmation){
                const salt=await bcrypt.genSalt(10);
                const hashedPassword=await bcrypt.hash(password,salt);
                await User.findByIdAndUpdate(user._id,{$set:{password:hashedPassword}});
                res.status(200).json({message:'Password reset successfully'});
            }
            else{
                res.status(400).json({message:'Passwords do not match'});
            }
        }
        else{
            res.status(400).json({message:'All fields are required'});
        }


    }catch(err){
        res.status(400).json({message:'Invalid token'});
    }
}

module.exports={userRegister,userLogin,changePassword,loggedUser,sendUserpasswordResetEmial,resetPassword}