require("dotenv").config();
const express = require("express");
const upload = require("express-fileupload");
const xlsx = require("xlsx");
const bodyParser = require("body-parser");
const session = require("express-session");
const app = express();

app.use(upload());
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(session({
  secret: "tajna",
  resave: true,
  saveUnintilazed: true
}));


app.get("/", function (req, res) {
  res.render("home")
})

//PROFESOR
app.post('/auth', function (req, res) {
  var username = req.body.usernameProf;
  var password = req.body.passwordProf;
  if (username == "p" && password == process.env.PASS) {
    req.session.loggedin = true;
    req.session.username = username;
    res.redirect('/profesor');
  } else {
    res.render("profesorLogin", { error: 'Pogresna lozinka ili korisnicko ime' })
    res.end();
  }
});

app.get("/profesorLogin", function (req, res) {
  res.render("profesorLogin", { error: null });
});

app.get("/profesor", function (req, res) {
  if (req.session.loggedin) {
    res.render("profesor");
  } else {
    res.render("profesorLogin");
  }
  res.end();
});



//STUDENT
app.get("/studentLogin", function (req, res) {
  res.render("studentLogin");
})

app.post("/student", function (req, res) {
  const id = req.body.usernameStudent
  res.redirect('/student?id=' + id)
})

app.get("/student", function (req, res) {
  let studentInput = req.query.id;
  var workbook = xlsx.readFile("uploads/fajl.xlsx");
  let worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const aktivnosti = []
  for (var i = 2; worksheet[`A${i}`]; i++) {
    const id = worksheet[`A${i}`].v;
    const ime = worksheet[`B${i}`].v;
    const aktivnost = worksheet[`C${i}`].v;
    const vreme = worksheet[`D${i}`].v;
    const napomena = worksheet[`F${i}`].v;
    const idSplit = id.split('/');
    indeks = idSplit.join('');
    if (studentInput == indeks) {
      aktivnosti.push({
        id,
        name: ime,
        aktivnost,
        vreme,
        napomena
      })
    }
  }
  res.render("student", { aktivnosti })
});

app.post("/osvezi", function (req, res) {
  if(req.session.loggedin) {
    res.render("profesorLogin");
    return;
  }
  if (req.files) {
    var file = req.files.file;
    var fileName = file.name;
    file.mv("./uploads/fajl.xlsx", function (err) {
      if (err) {
        res.status(403).json({ success: false, error: err });
      } else {
        var workbook = xlsx.readFile(`uploads/fajl.xlsx`);
        let worksheet = workbook.Sheets[workbook.SheetNames[0]];
        for (var i = 2; worksheet[`A${i}`]; i++) {
          const indeks = worksheet[`A${i}`].v;
          const ime = worksheet[`B${i}`].v;
          const aktivnost = worksheet[`C${i}`].v;
          const vreme = worksheet[`D${i}`].v;
          const napomena = worksheet[`F${i}`].v;
          console.log({
            id: indeks,
            name: ime,
            aktivnost: aktivnost,
            vreme: vreme,
            napoena: napomena
          });
        }
      }
    });
    res.status(200).json({ success: true })
    console.log(fileName);
  }
});


app.listen(3000, (req, res) => {
  console.log("listening...");
});