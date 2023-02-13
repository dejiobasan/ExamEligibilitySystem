//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const app = express();

const port = 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.get("/", function(req, res) {
    res.render("landing");
});



app.listen(port, function () {
    console.log("server started at port 3000.");
});