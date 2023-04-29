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

app.get("/", (req, res) => {
    res.render("landing");
});

app.get("/EnrollStudents", (req, res) => {
    res.render("EnrollStudents");
});

app.get("/EnrollLecturers", (req, res) => {
    res.render("EnrollLecturers");
});

app.get("/ExamCheckIn", (req, res) => {
    res.render("ExamCheckIn")
});

app.get("/ExamCheckOut", (req, res) => {
    res.render("ExamCheckOut")
});

app.get("/EnrollSuccess", (req, res) => {
    res.render("EnrollSuccess")
});

app.get("/AuthSuccess", (req, res) => {
    res.render("AuthSuccess")
});

app.get("/AuthFailure", (req, res) => {
    res.render("AuthFailure")
});



//<-- REUSABLE CODE -->
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
// <-- REUSABLE CODE -->


app.post("/EnrollStudents", async (req, res) => {
    const FirstName = req.body.SFname;
    const LastName = req.body.SLname;
    const MatricNo = req.body.matricno;
    const CourseCode = req.body.SCoursecode;
    const CourseTitle = req.body.SCoursetitle;
    const base64Image = req.body.image1;
    const base64Image2 = req.body.image2;
    const base64Image3 = req.body.image3;
    const base64Image4 = req.body.image4;
    const base64Image5 = req.body.image5;
    
    // console.log(base64Image)
    // console.log(Object.keys(req.body))
    connection1.query('INSERT INTO students (LastName, FirstName, MatricNumber, CourseCode, CourseTitle, fingerprint_template, fingerprint_template2, fingerprint_template3, fingerprint_template4, fingerprint_template5) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [LastName, FirstName, MatricNo, CourseCode, CourseTitle, base64Image, base64Image2, base64Image3, base64Image4, base64Image5], (err, result) => {
        if (err) {
            console.log(err)
            res.status(401).json({sucess: false})
        } else {
            res.json({sucess: true})
        } 
    });
});


app.post("/EnrollLecturers", (req, res) => {
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

app.get("/Reports", (req, res) => {
    connection1.query("SELECT * from students", (error, rows) => {
        if (error) throw error;
        res.render("Reports", { data: rows});
    });
});

app.post("/ExamCheckIn", async (req, res) => {
    const matricno = req.body.matric
    const image1 = req.body.image

    const result = await new Promise((resolve, reject) => {
        connection1.query("select fingerprint_template, fingerprint_template2, fingerprint_template3, fingerprint_template4, fingerprint_template5 from students where MatricNumber = ?",  [matricno], (err, result) => {
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

    let images = Object.values(result[0]).map(img => img.toString())


    const response = await axios.post("http://localhost:9000/compare_fingerprints", {
        img1: image1,
        images
    });

    console.log(response.data)
    if (response.data.isSame) {
        res.json({isSame: true})
    } else {
        res.status(401).json({isSame: false})
    }
});

app.post("/ExamCheckOut", async (req, res) => {
    const matricno = req.body.matric
    const image1 = req.body.image

    const result = await new Promise((resolve, reject) => {
        connection1.query("select fingerprint_template, fingerprint_template2, fingerprint_template3, fingerprint_template4, fingerprint_template5 from students where MatricNumber = ?",  [matricno], (err, result) => {
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

    let images = Object.values(result[0]).map(img => img.toString())


    const response = await axios.post("http://localhost:9000/compare_fingerprints", {
        img1: image1,
        images
    });

    console.log(response.data)
    if (response.data.isSame) {
        res.json({isSame: true})
    } else {
        res.status(401).json({isSame: false})
    }
});





app.listen(port,  () => {
    console.log("server started at port 3000.");
});

