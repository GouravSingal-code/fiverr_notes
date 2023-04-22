const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName:String,
  lastName:String,
  email:String,
  password:String,
});


const spaceSchema = new mongoose.Schema({
    spaceId:Number,
    notes:[{
       id:Number, 
       text:  String,
       updatedTime:Date,
     }],
})

const notesSchema = new mongoose.Schema({
  noteId:Number,
  spaceId:Number,
  noteTitle:String,
  noteText:String,
  date:Date,
})

const todoListSchema = new mongoose.Schema({
    todoId:Number,
    todoText:String,
    deadlineTime:Date 
})

module.exports = userSchema;
module.exports = spaceSchema;
module.exports = todoListSchema;
module.exports = notesSchema;


