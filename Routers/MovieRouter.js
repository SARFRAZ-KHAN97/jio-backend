const express= require("express");

const movieRouter= express.Router();


const {getActionMovies, getComedyMovies, getHorrorMovies, getRomanceMovies, getAnimeMovies, getMovieDetails}= require("../controllers/MovieController");


movieRouter
    .get("/action", getActionMovies)
    .get("/comedy", getComedyMovies)
    .get("/horror", getHorrorMovies)
    .get("/romance", getRomanceMovies)
    .get("/anime", getAnimeMovies)
    .get("/details", getMovieDetails);


module.exports= movieRouter;