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
    const FirstName = req.body.SFname;
    const LastName = req.body.SLname;
    const MaticNo = req.body.matricno;
    const CourseCode = req.body.SCoursecode;
    const CourseTitle = req.body.SCoursetitle;
    // const fingerprinttemplate = ;


    connection1.query('INSERT INTO studentsdb (LastName, FirstName, MatricNumber, CourseCode, CourseTitle, fingerprint_template) VALUES (?, ?, ?, ?, ?, ?)', [LastName, FirstName, MaticNo, CourseCode, CourseTitle, fingerprinttemplate], (err, result) => {
        if (err) throw err;
        res.send("<h1>Successfully Enrolled!</h1>")
        });
});

app.post("/EnrollLecturers", function(req, res){
    const LFirstName = req.body.LFname;
    const LLastName = req.body.LLname;
    const LCourseCode = req.body.LCoursecode;
    const LCourseTitle = req.body.LCoursetitle;
    connection2.query('INSERT INTO lecturersdb (LastName, FirstName, CourseCode, CourseTitle) VALUES (?, ?, ?, ?)', [LLastName, LFirstName, LCourseCode, LCourseTitle], (err, result) => {
    if (err) throw err;
    res.redirect("Reports");
    });

});

app.get("/Reports", function(req, res){

});

app.post("/ExamCheckIn", function(req, res){

});




app.listen(port, function () {
    console.log("server started at port 3000.");
});