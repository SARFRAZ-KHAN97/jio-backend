const mongoose = require("mongoose");
  


const wishlistSchema= new mongoose.Schema({
    poster_path: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    }
});






const schemaRules = {
        name: {
            type: String,
            required: [true, "name is required"]
        },
        email: {
            type: String,
            required: [true , "email is required"],
            unique: [true, "email should be unique"]
        },
        password: {
            type: String,
            required: [true, "Paswod is required"],
            minLength: [6, "Password should be atleast 6 length"]
        },
        confirmPassword: {
            type: String,
            required: true,
            validate: [ function () {
                return this.password == this.confirmPassword;
            }, "Password should be same" ]
        },
        craetedAt: {
            type: Date,
            default: Date.now()
        },
        isPremium: {
            type: Boolean,
            default: false
        },
        role: {
            type: String,
            enum: ["user","admin","feed curator","moderator"],  //possilble values for role
            default: "user"
        },
        otp: {
            type: Number
        },
        otpExpiry: {
            type: Date
        },
        wishlist: [wishlistSchema]
}

const userSchema = new mongoose.Schema(schemaRules);


userSchema.pre("save", function(next) {
    this.confirmPassword= undefined;
    next();
})

userSchema.post("save", function() {
    this.__v= undefined;
    this.confirmPassword= undefined;
    
})







const userModel = mongoose.model("jioUsers",userSchema);






module.exports = {userModel};