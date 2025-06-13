const { userModel } = require("../Models/userModel");

const getCurrentUser= async (req, res) => {
    try {
        const userId= req.userId;
        const {_id, name, email, createdAt, wishlist, isPremium}= 
            await userModel.findById(userId);

        res.status(200).json({
            user: {
                _id: _id, 
                name: name, 
                email: email, 
                createdAt: createdAt, 
                wishlist: wishlist, 
                isPremium: isPremium
            },
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



const getUserWishlist= async (req, res) => {
    try {
        const userId= req.userId;
        const user= await userModel.findById(userId);   // can use .populate("wishlist") to get actual documents instead of just product ids
        res.status(200).json({
            userWishlist: user.wishlist,
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



const addToWishlist= async (req, res) => {
    try {
        const userId= req.userId;
        const {id, poster_path, name, media_type}= req.body;
        const user= await userModel.findById(userId);

        if(!user) {
            return res.status(404).json({
                message: "user does not exist",
                status: "failure"
            })
        }

        if(user.wishlist.some(item => item.id === id)) {
            return res.status(400).json({
                message: "product already in wishlist",
                status: "failure"
            })
        }

        const wishlistItem= {
            poster_path: poster_path,
            name: name,
            id: id,
            media_type: media_type 
        };


        user.wishlist.push(wishlistItem);

        await user.save({validateBeforeSave: false});

        res.status(200).json({
            message: "product added to wishlist",
            status: "success"
        });
    }
    catch (err) {
        res.status(500).json({
            message: err.message,
            status: "failure"
        })
    }
}





module.exports= {
    getCurrentUser,
    getUserWishlist,
    addToWishlist
}




