require("dotenv").config();
const { JSDOM } = require( "jsdom" );
const { window } = new JSDOM( "" );
const $ = require( "jquery" )( window );
const express=require("express");
const upload=require("express-fileupload");
const xlsx= require("xlsx");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const session=require("express-session");
const paht=require("path");
const app= express();
var ime;
var aktivnost;
var vreme;
var napomena;
app.use(upload());


app.use(express.static("public"));
app.set('view engine','ejs');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(session({
  secret:"tajna",
  resave:true,
  saveUnintilazed:true
}));

app.get("/", function (req,res) {
 res.render("home")
})


//PROFESOR

app.post('/auth', function(req, res) {
	var username = req.body.usernameProf;
	var password = req.body.passwordProf;
	if (username=="p" && password==process.env.PASS) {
      req.session.loggedin = true;
				req.session.username = username;
				res.redirect('/profesor');
	} else {
		res.redirect("profesorLogin")
		res.end();
	}
});

app.get("/profesorLogin",function(req,res) {
  res.render("profesorLogin");
  });

app.get("/profesor",function(req,res) {
  if (req.session.loggedin) {
  		res.render("profesor");
  	} else {
  		res.render("profesorLogin");
  	}
  	res.end();
});



//STUDENT
  app.get("/studentLogin",function (req,res) {
    res.render("studentLogin");
  })
  app.post("/student",function(req,res) {
      let studentInput=req.body.usernameStudent;
      var workbook=xlsx.readFile("uploads/proba.xlsx");
      let worksheet=workbook.Sheets[workbook.SheetNames[0]];
      for (var i = 2; i < 96; i++) {
      const id=worksheet[`A${i}`].v;
      const ime=worksheet[`B${i}`].v;
      const aktivnost=worksheet[`C${i}`].v;
      const vreme=worksheet[`D${i}`].v;
      const napomena=worksheet[`F${i}`].v;
      const idSplit=id.split('/');
      indeks=idSplit.join('');
      if (studentInput==indeks) {
        //ovde umesto log treba da ispise u isto prozoru dole za studenta , odnosno da ubaci u tabelu.
       console.log({id:id, name:ime, aktivnost:aktivnost,vreme:vreme,napoena:napomena});
       }else {
         //OVDE TREBA DA PISE U FRONTENDU STUDENT NEMA AKTIVNOSTI
     }
    }




      });



app.post("/osvezi",function (req,res) {
  if (req.files) {
    var file= req.files.file;
    var fileName=file.name;
    file.mv("./uploads/"+fileName,function (err) {
      if(err){
        res.send(err);
      }else {
        var workbook=xlsx.readFile("uploads/proba.xlsx");
        let worksheet=workbook.Sheets[workbook.SheetNames[0]];
        for (var i = 2; i < 10; i++) {
        const indeks=worksheet[`A${i}`].v;
        const ime=worksheet[`B${i}`].v;
        const aktivnost=worksheet[`C${i}`].v;
        const vreme=worksheet[`D${i}`].v;
        const napomena=worksheet[`F${i}`].v;
        console.log({id:indeks, name:ime, aktivnost:aktivnost,vreme:vreme,napoena:napomena});
      }
      }
    });
    console.log(fileName);
  }});


app.listen(3000, (req, res) => {
  console.log("listening...");
});
