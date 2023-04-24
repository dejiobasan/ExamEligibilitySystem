//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mysql = require("mysql2");
const request = require("request");
// const cheerio = require("cheerio");
const dotenv = require("dotenv");
const axios = require("axios")

const fs = require('fs')
dotenv.config();

const app = express();

const port = 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.json({limit: '200mb'}));
app.use(bodyParser.urlencoded({limit: '200mb', extended: true}));
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
});

app.get("/ExamCheckOut", (req, res) => {
    res.render("ExamCheckOut")
});

// app.get("/save-template", (req, res) => {
//     const url = "https://localhost:3000/EnrollStudents";
//     request(url, async (error, response, html) => {
//         async function wait(duration) {
//             return new Promise((resolve) => {
//                 setTimeout(() => resolve(), duration * 1000)
//             })
//         }
//         await wait(10);
//         if (!error && response.statusCode === 200) {
//             const $ = cheerio.load(html);
//             const imageUrl = $("img").attr("src");

//             request({url: imageUrl, encoding: null}, (error, response, buffer) => {
//                 if (!error && response.statusCode === 200) {
//                     base64Image = Buffer.from(buffer).toString("base64");
//                     connection1.query("INSERT INTO students (fingerprint_template) VALUES (?)", [base64Image], (err, result) => {
//                         if (err) throw err;
//                     });
//                 } else {
//                     console.error(error);
//                     res.status(500).send("Error downloading image!");
//                 }
//             })
//         } else {
//             console.error(error);
//             res.status(500).send("Error requesting EJS page!");
//         }
//     });
// });


app.post("/EnrollStudents", async function(req, res){
    const FirstName = req.body.SFname;
    const LastName = req.body.SLname;
    const MatricNo = req.body.matricno;
    const CourseCode = req.body.SCoursecode;
    const CourseTitle = req.body.SCoursetitle;
    const base64Image = req.body.image;

    // console.log(base64Image)
    connection1.query('INSERT INTO students (LastName, FirstName, MatricNumber, CourseCode, CourseTitle, fingerprint_template) VALUES (?, ?, ?, ?, ?, ?)', [LastName, FirstName, MatricNo, CourseCode, CourseTitle, base64Image], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.render("EnrollSuccess");
        } 
    });
});

app.post("/EnrollLecturers", function(req, res){
    const LFirstName = req.body.LFname;
    const LLastName = req.body.LLname;
    const LCourseCode = req.body.LCoursecode;
    const LCourseTitle = req.body.LCoursetitle;
    connection2.query('INSERT INTO lecturers (LastName, FirstName, CourseCode, CourseTitle) VALUES (?, ?, ?, ?)', [LLastName, LFirstName, LCourseCode, LCourseTitle], (err, result) => {
        if (err) {
            console.log(err);
        }
        else {
            res.redirect("Reports");
        } 
    });
});

app.get("/Reports", function(req, res){
    connection1.query("SELECT * from students", (error, rows) => {
        if (error) throw error;
        res.render("Reports", { data: rows});
    });
});

app.post("/ExamCheckIn",async function(req, res){
    const matricno = req.body.matric
    const image1 = req.body.image

    const result = await new Promise((resolve, reject) => {
        connection1.query("select fingerprint_template from students where MatricNumber = ?",  [matricno], (err, result) => {
            if (err) {
                console.log(err);
            }
            else {
                resolve(result)
                
            } 
        });
    });
   
   
    if (result.length === 0) {
        res.send("Error! The following matric number does not have a fingerprint enrolled.")
        return
    }
    let image2 = result[0].fingerprint_template.toString()
    

    const response = await axios.post("http://localhost:9000/compare_fingerprints", {
        img1: image1,
        img2: image2
    });

    if (response.data.isSame) {
        res.render("AuthSuccess")
    } else {
        res.render("AuthFailure")
    }
});



app.listen(port, function () {
    console.log("server started at port 3000.");
});

