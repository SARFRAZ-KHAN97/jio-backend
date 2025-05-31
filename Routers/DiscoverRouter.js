const express= require("express");

const discoverRouter= express.Router();


const {getNowPlaying, getTrending, getTopRated, getUpcoming}= require("../controllers/DiscoverController");


discoverRouter
    .get("/now-playing", getNowPlaying)
    .get("/trending", getTrending)
    .get("/top-rated", getTopRated)
    .get("/upcoming", getUpcoming);




module.exports= discoverRouter;