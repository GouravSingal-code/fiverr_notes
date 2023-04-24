const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName:String,
  lastName:String,
  email:String,
  password:String,
});


const spaceSchema = new mongoose.Schema({
    email:String,
    spaceId:Number,
    notes:[{
       id:Number, 
       text:  String,
       updatedTime:Date,
     }],
})

const notesSchema = new mongoose.Schema({
  email:String,
  noteId:Number,
  spaceId:Number,
  noteTitle:String,
  noteText:String,
  date:Date,
})

const todoListSchema = new mongoose.Schema({
    email:String,
    todoId:Number,
    todoText:String,
    deadlineTime:Date 
})

module.exports = userSchema;
module.exports = spaceSchema;
module.exports = todoListSchema;
module.exports = notesSchema;


