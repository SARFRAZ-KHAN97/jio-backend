const express= require("express");


const tvShowRouter= express.Router();


const {getActionTvShows, getComedyTvShows, getMysteryTvShows, getDramaTvShows, getCrimeTvShows, getTvShowsDetails}= require("../controllers/TvController");
const { get } = require("mongoose");


tvShowRouter
    .get("/action", getActionTvShows)
    .get("/comedy", getComedyTvShows)
    .get("/crime",getCrimeTvShows)
    .get("/drama", getDramaTvShows)
    .get("/mystery", getMysteryTvShows)
    .get("/details", getTvShowsDetails);



module.exports= tvShowRouter;