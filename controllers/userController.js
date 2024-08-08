const ErrorHandler = require("../utils/errorhandler")
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail")

// Register our User

exports.registerUser = catchAsyncErrors(async(req,res,next)=>{

    const {name, email, password} = req.body;

    const user = await User.create({
        name,email,password,
        avatar:{
            public_id:"This is a simple id",
            url:"profilepic"
        }
    });

    sendToken(user,201,res)

})

// Login User

exports.loginUser = catchAsyncErrors(async(req,res,next) => {
    
    const {email, password} = req.body;

    // Checking if user has given both password and email

    if(!email || !password){
        return next(new ErrorHandler("Please Enter Email and Password", 400))
    }

    const user = await User.findOne({email}).select("+password");

    if(!user){
        return next(new ErrorHandler("Inavalid email or password",401));
    }

    const isPasswordMatched = user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Inavalid email or password",401));
    }

    sendToken(user,200,res)
})

// LOGOUT User

exports.logout = catchAsyncErrors(async(req,res,next)=>{

    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly:true
    })

    res.status(200).json({
        success:true,
        message: "Logged out",

    })
})

// Forgot Password
exports.forgotPassword = catchAsyncErrors(async(req,res,next) =>{
    const user = await User.findOne({email:req.body.email});

    if(!user){
        return next(new ErrorHandler("User not found", 404))
    }

    // Get Reset Password Token

    const resetToken = user.getResetPasswordToken();

    await user.save({validateBeforeSave:false})

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

    const message = `Your Password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email
    then, please ignore it `;

    try {
        
        await sendEmail({
            email:user.email,
            subject:`Ecommerce Password Recovery`,
            message,
        });

        res.status(200).json({
            success:true,
            message : `Email sent to ${user.email} successfully`,
        })

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({validateBeforeSave:false})

        return next(new ErrorHandler(error.message, 500))

    }
});