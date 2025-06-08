const express = require ("express");
const app = express();
const jwt = require("jsonwebtoken");
const {userModel} = require("../Models/userModel");
const dotenv = require("dotenv");



dotenv.config();

const util = require("util");
//const emailSender = require("../dynamicEmailSender");
const promisify = util.promisify;


const promisifiedJWTsign = promisify(jwt.sign);
const promisifiedJWTverify = promisify(jwt.verify);


app.use(express.json());




async function signUpHandler(req, res) {
    
    try {
        const userObject = req.body;
        
        if(!userObject.email || !userObject.password) {
            return res.status(400).json({
                message:  "required data missing",
                status: "failure"
            })
        }
            
        const user = await userModel.findOne({email: userObject.email}); //gives null when not found 
        if(user) {
            return res.status(400).json({
                message:  "user already exists",
                status: "failure"
            })
        }

        
        const newUser = await userModel.create(userObject);
        console.log("hii")
        res.status(201).json({
            "message": "user created successfully",
            status: "success"
        }) 
    } 
    catch (err) {
        res.status(500).json({
            message: err.message,
            status: "failed"
        })
    }
}



async function loginHandler(req, res) {
   
    try{
        
        const {email, password} = req.body;
        const user = await userModel.findOne({email});
        if(!user) {
            return res.status(404).json({
                message: "Invalid email or password",
                status: "failure"
            })
        }
        const areEqual = password==user.password;
        if(!areEqual) {
            return res.status(404).json({
                message: "Invalid email or password",
                status: "failure"
            })
        }

        const authToken = await promisifiedJWTsign({id: user["_id"]}, process.env.JWT_SECRET_KEY, {algorithm: "HS256"}); //algo is by default selected same so can be skipped
        
        res.cookie("custom_jwt", authToken, {
            maxAge: 1000*60*60*24,
            httpOnly: true, 
            secure: true
        })
        res.status(200).json({
            message: "login successfull",
            status: "success",
            user: user
        })
        

    }
    catch (err) {
        if (err.name === "ValidationError") {
        return res.status(400).json({
            message: err.message, 
            status: "failure"
        });
    }

    res.status(500).json({
        message: "Internal Server Error",
        status: "failed"
    });
    }
}


async function protectedRouteMiddleware(req, res, next) {
    try{
        const token = req.cookies.custom_jwt;
        console.log(token);
        if(!token) {
            return res.status(401).json({
                message: "unauthorized access",
                status: "failure"
            })
        }
        const unlockedToken = await promisifiedJWTverify(token, process.env.JWT_SECRET_KEY);    //unlockedToken has payload i.e id which can be use track user of the cookie 
        req.id= unlockedToken.id; 
        next();
    }
    catch (err) {
        res.status(500).json({
            message: "internal server error",
            status: "failure"
        })
    }
}


async function profileHandler(req, res) {
    try{
        const userId= req.id;
        const user = await userModel.findById(userId);
        
        if(!user) {
            return res.status(404).json({
                message: "user does not exist",
                status: "failure"
            })
        }

        res.json({
            message: "profile worked",
            status: "success", 
            user: user
    })
    }
    catch (err) {
        res.status(500).json({
            message: err.message,
            status: "failure"
        })
    }
}


function logoutHandler(req, res) {
    try{
        res.clearCookie('custom_jwt', {
            path: '/',
            httpOnly: true,
            secure: true
        });
        res.status(200).json({
            message: "logout successfull",
            status: "success"
        })
    }
    catch (err) {
        res.status(500).json({
            message: err.message,
            status: "failure"
        })
    }
}


async function isAdminMiddleware(req, res, next) {
    try{
        const userId = req.id;
        const user = await userModel.findById(userId);
        if(user.role !== 'admin') {
            return res.status(403).json({
                message: "unauthorized access to admin",
                status: "failure"
            })
        }
        next();
    }
    catch (err) {
        res.status(500).json({
            message: "internal server error",
            status: "failure"
        })
    }
}


const otpGenerator= function() {
    return Math.floor(1000 + Math.random() * 9000);
}

async function forgetPasswordHandler(req, res) {
    try {

        if(req.body.email==undefined) {
            return res.status(401).json({
                status: "failure",
                message: "email is required"
            })
        }

        const user= await userModel.findOne({email: req.body.email});
        if(!user) {
            return res.status(404).json({
                message: "user does not exist for given email",
                status: "failure"
            })
        }
        
        const otp= otpGenerator();
        user.otp= otp;
        user.otpExpiry= Date.now()+1000*60*2; 
    
        await user.save({validateBeforeSave: false});
        
        const templateData= {name: user.name, otp: otp};
        emailSender("./templates/otp.html", user.email, templateData);


        res.status(200).json({
            message: "otp sent successfully",
            status: "success",
            otp: otp,
            resetURL: `http://localhost:3000/api/auth/resetPassword/${user["_id"]}`
        })

    }
    catch(err) {
        res.status(500).json({
            message: err.message,
            status: "failure"
        })
    }
}

async function resetPasswordHandler(req, res) {
    try{
        let resetDetails= req.body;
        if(!resetDetails.otp || !resetDetails.password || !resetDetails.confirmPassword
            || resetDetails.password != resetDetails.confirmPassword ) 
        {
            return res.status(401).json({
                message: "otp or password is required",
                status: "failure"
            })
        }

        const userId= req.params.userId;
        const user= await userModel.findById(userId);

        if(!user) {
            return res.status(404).json({
                message: "user does not exist",
                status: "failure"
            })
        }

        if(user.otp == undefined) {
            return res.status(404).json({
                message: "unauthorized access",
                status: "failure"
            })
        }

        if(Date.now() > user.otpExpiry) {
            return res.status(404).json({
                message: "otp expired",
                status: "failure"
            })
        }

        if(user.otp != resetDetails.otp) {
            return res.status(404).json({
                message: "invalid otp",
                status: "failure"
            })
        }
        user.password= resetDetails.password;
        user.otp= undefined;
        user.otpExpiry= undefined;
        await user.save({validateBeforeSave: false});
        res.status(200).json({
            message: "password reset successfully",
            status: "success"
        })


    }
    catch(err) {
        res.status(500).json({
            message: err.message,
            status: "failure"
        })
    }
}


module.exports = {
    signUpHandler, loginHandler, protectedRouteMiddleware, profileHandler, logoutHandler, isAdminMiddleware, forgetPasswordHandler, resetPasswordHandler
}