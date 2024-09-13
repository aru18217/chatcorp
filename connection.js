const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(`mongodb+srv://didit:didit123@data1.guug4ed.mongodb.net/?retryWrites=true&w=majority&appName=data1`, ()=> {
  console.log('connected to mongodb')
})
