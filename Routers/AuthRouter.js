const express = require('express');


const authRouter = express.Router();


const {signUpHandler, loginHandler, protectedRouteMiddleware, profileHandler, logoutHandler, forgetPasswordHandler, resetPasswordHandler} = require("../controllers/AuthController");



authRouter
    .post("/login", loginHandler)
    .post("/signup", signUpHandler)
    .get("/logout", logoutHandler)
    .get("/profile", protectedRouteMiddleware, profileHandler)  
    .patch("/forgetPassword", forgetPasswordHandler)
    .patch("/resetPassword/:userId", resetPasswordHandler);

module.exports = authRouter;