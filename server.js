const express = require("express");
const ejs = require("ejs");
const expressLayouts = require("express-ejs-layouts");
const bcrypt = require("bcryptjs");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const url = require('url');   
const cors = require('cors');
const location = require('location');
require("dotenv").config();
const { userSchema, spaceSchema, todoListSchema , notesSchema } = require("./schema");


const app = express();

app.use(cors())
app.use(express.json())

app.use(bodyparser.json());
app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({ extended: false }));
app.use(express.static("public"));

var mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/gourav";

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

var db = mongoose.connection;
const user = db.collection("user");
const space = db.collection("space");
const todo = db.collection("todo");
const note = db.collection("note");
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connection Successful!");
});


app.get('/profile' , (req , res)=>{
  user.findOne({email:req.query.email})
  .then(data=>{
    res.render('profile.ejs' , {fname:data.fname , lname:data.lname , email:data.email});
  })
  .catch(err=>{
    console.log(err);
  })
 
})

app.get("/home", async (req, res) => {
  let todoList = [];
  for await (const doc of todo.find()) {
    todoList.push(doc);
  }
  res.render("home.ejs" ,{todo:todoList})
 
});

app.post("/checkUserLogin", (req, res) => {
  let userDetails = req.body;

  user
  .findOne({ email: userDetails.email })
  .then((data) => {
    if (data == null) {
      res.redirect('/registration');
    } else {
      res.redirect(url.format({
        pathname:"/home"
      }))    
    }
  })
  .catch((err) => {
    console.log(err);
  });

});

app.post("/registerUser", (req, res) => {
  let userDetails = req.body;

  user
    .findOne({ email: userDetails.email })
    .then((data) => {
      if (data == null) {
        user
          .insertOne(userDetails)
          .then((data) => {
            res.redirect(url.format({
            pathname:"/home",
            query: userDetails
          }))})
          .catch((err) => {
            console.log(err);
          });
      } else {
        res.redirect("/login");
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/registration", (req, res) => {
  res.render("registration.ejs");
});

app.get('/forgetPassword' , (req , res)=>{
  res.render('updatePassword.ejs');
})

app.post("/updatePassword", (req, res) => {
  user
    .findOneAndUpdate({email:req.body.email} , {$set:{password:req.body.password}} , {
      returnNewDocument:true
    })
    .then((data) => {
      res.redirect('/login');     
    })
    .catch((err) => {
      console.log(err);
    });
});


app.get("/space", async (req, res) => {  
  let spaceList = [];
  for await (const doc of space.find()) {
    spaceList.push(doc);
  }
  console.log(spaceList);
  res.render("space.ejs", { spaces:JSON.stringify(spaceList) });
});

app.post("/createSpace", async (req, res) => {
  let spaceObject = req.body;
  
  spaceObject["spaceId"] = parseInt(spaceObject["spaceId"]);

  space
    .insertOne(spaceObject)
    .then((data) => {
       res.redirect('/space');    
    })
    .catch((err) => {
      console.log(err);
    });

});

app.post("/updateSpace" , async (req , res)=>{
  let spaceObject = req.body;
  spaceObject["spaceId"] = parseInt(spaceObject["spaceId"]);

  space
    .findOneAndUpdate({spaceId:parseInt(req.body.spaceId)} , {$set:spaceObject} , {
      returnNewDocument:true
    })
    .then((data) => {
      res.redirect('/space');     
    })
    .catch((err) => {
      console.log(err);
    });

})

app.post("/deleteSpace", (req, res) => {

  note.deleteOne({spaceId:parseInt(req.body.spaceId)})
  .then(data=>{
    console.log(data);
  })
  .catch(err=>{
    console.log(err);
  })


  space.deleteOne({spaceId:parseInt(req.body.spaceId)})
  .then(data=>{
    console.log(data);
    res.redirect('/space');    
  })
  .catch(err=>{
    console.log(err);
  })
});


app.get("/note", async (req, res) => {  
  console.log(req.query);
  let noteList = [];
  for await (const doc of note.find({spaceId:parseInt(req.query.spaceId)})) {
    noteList.push(doc);
  }
  res.render("notes.ejs", { notes:JSON.stringify(noteList),spaceId: parseInt(req.query.spaceId) });
});

app.post("/createNote", async (req, res) => {
  let noteObject = req.body;
  
  noteObject["noteId"] = parseInt(noteObject["noteId"]);
  noteObject["spaceId"] = parseInt(noteObject["spaceId"]);

  note
    .insertOne(noteObject)
    .then((data) => {
       res.redirect('/note?spaceId='+noteObject["spaceId"].toString());    
    })
    .catch((err) => {
      console.log(err);
    });

});

app.post("/updateNote" , async (req , res)=>{
  let noteObject = req.body;

  noteObject["noteId"] = parseInt(noteObject["noteId"]);
  noteObject["spaceId"] = parseInt(noteObject["spaceId"]);

  note
    .findOneAndUpdate({noteId:parseInt(req.body.noteId) , spaceId:parseInt(req.body.spaceId)} , {$set:noteObject} , {
      returnNewDocument:true
    })
    .then((data) => {
      res.redirect('/note?spaceId='+req.body.spaceId);     
    })
    .catch((err) => {
      console.log(err);
    });

})

app.post("/deleteNote", (req, res) => {
  note.deleteOne({noteId:req.body.noteId , spaceId:parseInt(req.body.spaceId)})
  .then(data=>{
    console.log(data);
    res.redirect('/note?spaceId='+req.body.spaceId);    
  })
  .catch(err=>{
    console.log(err);
  })
});



app.get("/todo", async (req, res) => {
  // get todo
  let redirect = '/createTodo';
  if( req.query.redirect != null && req.query.redirect != undefined && req.query.redirect != "" ){
    redirect = req.query.redirect + "?id=" + req.query.id;
  }

  let currentTodo = req.query;
  let todoList = [];
  for await (const doc of todo.find()) {
    todoList.push(doc);
  }
  res.render("todoList.ejs", { todo: todoList , currentTodo:currentTodo , redirect: redirect });
});

app.post("/createTodo", async (req, res) => {

  let todoObject = req.body;
  todoObject["todoId"] = Math.floor(Math.random() * 1000);

  todo
    .insertOne(todoObject)
    .then((data) => {
       res.redirect('/todo');    
    })
    .catch((err) => {
      console.log(err);
    });

});

app.post("/updateTodo" , async (req , res)=>{
  let todoObject = req.body;
  let id = req.query.id;
  todoObject['todoId'] = parseInt(id);


  todo
    .findOneAndUpdate({todoId:parseInt(id)} , {$set:todoObject} , {
      returnNewDocument:true
    })
    .then((data) => {
       res.redirect('/todo');    
    })
    .catch((err) => {
      console.log(err);
    });

})

app.get("/editTodo", (req, res) => {
  todo.findOne({todoId:parseInt(req.query.id)})
  .then(data=>{
    data['redirect'] = '/updateTodo';
    data['id'] = req.query.id;
    res.redirect(res.redirect(url.format({
      pathname:"/todo",
      query:data,
    })));  
  })
  .catch(err=>{
    console.log(err);
  })
  // edit todo with given todo id
});

app.get("/deleteTodo", (req, res) => {
  todo.deleteOne({todoId:parseInt(req.query.id)})
  .then(data=>{
    console.log(data);
    res.redirect('/todo');  
  })
  .catch(err=>{
    console.log(err);
  })
});

app.listen("5000", () => {
  console.log("server is started");
});
