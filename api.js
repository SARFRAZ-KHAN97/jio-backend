const mongoose = require("mongoose");
const express = require ("express");
const app = express();
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors= require("cors");

dotenv.config();

const dbLink = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.uhvcw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.connect(dbLink)
    .then(function (connection) {
        console.log("connected to db")
    }).catch(err => console.log(err))





app.use(express.json());
app.use(cookieParser());


const corsConfig = {
    origin: true,
    credentials: true,
};
app.use(cors(corsConfig));
app.options(/.*/, cors(corsConfig));





const authRouter= require("./Routers/AuthRouter.js");
const movieRouter= require("./Routers/MovieRouter.js");
const discoverRouter= require("./Routers/DiscoverRouter.js");
const userRouter = require("./Routers/UserRouter.js");
const videoRouter= require("./Routers/VideoRouter.js");
const tvShowsRouter= require("./Routers/TvRouter.js");






app.use("/api/auth", authRouter);
app.use("/api/movies", movieRouter);
app.use("/api/discover", discoverRouter);
app.use("/api/user", userRouter);
app.use("/api/video", videoRouter);
app.use("/api/tv", tvShowsRouter);









const PORT= process.env.PORT || 3001; 

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});