const {userRegister,loggedUser,userLogin,changePassword,sendUserpasswordResetEmial,resetPassword} = require('../controllers/UserController.js');
const express = require('express');
const checkauth=require('../middleware/auth.js');
const router = express.Router();

//route level middleware

//public router
router.post('/register',userRegister);
router.post('/login',userLogin);
router.post('/passwordreset',sendUserpasswordResetEmial);
router.post('/reset/:id/:token',resetPassword);

//private router
router.post('/changepassword',checkauth,changePassword);
router.get('/logged',checkauth,loggedUser)

module.exports=router;