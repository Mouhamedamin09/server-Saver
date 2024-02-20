const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    userId:String,
    header: String,
    email: String,
    password: String,
    selectedIcon: String,
  });
  
  const DataModel = mongoose.model('Data', dataSchema);

  module.exports =DataModel;