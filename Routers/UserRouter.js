const express= require("express");

const userRouter= express.Router();



const { protectedRouteMiddleware } = require("../controllers/AuthController");
const { addToWishlist, getUserWishlist, getCurrentUser } = require("../controllers/UserController")


userRouter
    .use(protectedRouteMiddleware)
    .get("/wishlist", getUserWishlist)
    .get("/", getCurrentUser)
    .post("/addToWishlist", addToWishlist);





module.exports= userRouter;