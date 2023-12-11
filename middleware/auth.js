const JWT=require('jsonwebtoken');
const User=require('../models/User');

const checkauth=async(req,res,next)=>{
    try{
        const token=req.cookies.token;
        if(!token){
            return res.status(401).json({message:'You need to login'});
        }

        //verify token
        const {userId}=await JWT.verify(token,process.env.JWT_SECRET);

        //get user from token
        req.user=await User.findById(userId).select('-password');
        next();
    }
    catch(err){
        return res.status(500).json({message:err.message});
    }
}

module.exports=checkauth;