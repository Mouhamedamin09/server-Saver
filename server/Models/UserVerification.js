const mongoose = require('mongoose');

const userVerificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    
  },
  uniqueString: {
    type: String,
  },
  expiresAt: {
    type: Date,
    
  },
  
}
,{
    timestamps:true
});

const UserVerification = mongoose.model('UserVerification', userVerificationSchema);

module.exports = UserVerification;