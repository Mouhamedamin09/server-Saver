const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
  },
  verified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true
});


const User = mongoose.model('User', userSchema);

module.exports = User;