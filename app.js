//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

const port = 3000;

app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const connection1 = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE1
});

const connection2 = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE2
});

connection1.connect(function(err) {
    if (err) {
      console.error('Error connecting to database 1: ' + err.stack);
      return;
    }
    console.log('Connected to database 1.');
});
  
connection2.connect(function(err) {
    if (err) {
      console.error('Error connecting to database 2: ' + err.stack);
      return;
    }
    console.log('Connected to database 2.');
});


app.get("/", function(req, res) {
    res.render("landing");
});

app.get("/EnrollStudents", function(req, res) {
    res.render("EnrollStudents");
});

app.get("/EnrollLecturers", function(req, res) {
    res.render("EnrollLecturers");
});

app.get("/ExamCheckIn", function(req, res){
    res.render("ExamCheckIn")
}),


app.post("/EnrollStudents", function(req, res){
    // const FirstName = ;
    // const LastName = ;
    // const MaticNo = ;
    // const CourseCode = ;
    // const CourseTitle = ;
    // const fingerprinttemplate = ;

});

app.post("/EnrollLecturers", function(req, res){
    // const LFirstName = ;
    // const LLastName = ;
    // const LCourseCode = ;
    // const LCourseTitle = ;
});

app.post("/ExamCheckIn", function(req, res){

});




app.listen(port, function () {
    console.log("server started at port 3000.");
});