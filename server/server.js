const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./Models/User');
const UserVerification=require('./Models/UserVerification')
const DataModel=require("./Models/DataModel")
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const authenticateUser = require('./middleware/authenticateUser');
const bcrypt = require('bcrypt');

const app = express();
const port = 3005;

app.use(bodyParser.json());





const generateToken = (user) => {
  // Extract user data
  const { _id, email } = user;

  // Create a payload containing user data
  const payload = {
    user: {
      id: _id,
      email: email,
    },
  };

  // Generate a JWT token
  const token = jwt.sign(payload, process.env.SECRET_TOKEN_KEY, { expiresIn: '1h' }); // Token expires in 1 hour

  return token;
};


//email handler
const nodemailer=require("nodemailer")

//unique string



require("dotenv").config()

let transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user:process.env.AUTH_EMAIL,
    pass:process.env.AUTH_PASS,
  },
});





app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

mongoose.connect('mongodb+srv://admin:admin@try.ncjqchz.mongodb.net/Server?retryWrites=true&w=majority', {
  
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB:', err));



//sign up

// /register endpoint
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.verified) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }


    if (existingUser && !existingUser.verified) {
      await User.findByIdAndDelete(existingUser._id);
    }

    // Generate unique verification code
    const verificationCode = Math.floor(10000 + Math.random() * 90000);

    // Create a new user
    
    const newUser = await User.create({ username, email, password: hashedPassword });

    // Create a new UserVerification document
    const expirationTime = Date.now() + 3600000; // 1 hour from now
    await UserVerification.create({ userId: newUser._id, uniqueString: verificationCode, expiresAt: expirationTime });

    // Send email verification code
    await transporter.sendMail({
      from: '"Saver" mouhamedaminkraiem09@gmail.com',
      to: email,
      subject: 'Email Verification Code',
      text: `Your email verification code is: ${verificationCode}`,
    });

    // Send verification code back to the client
    res.status(201).json({ message: 'User registered successfully. Email verification code sent.', verificationCode });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// New endpoint for verifying the verification code
app.post('/verify', async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    // If user not found, return error
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if verification code matches
    const userVerification = await UserVerification.findOne({ userId: user._id, uniqueString: verificationCode });
    if (!userVerification || userVerification.expiresAt < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    // Update user's verified field to true
    await User.findOneAndUpdate({ _id: user._id }, { $set: { verified: true } });

    // If verification code is correct, return success message
    res.status(200).json({ message: 'Verification successful' });
  } catch (error) {
    console.error('Error verifying code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




//login

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    // If user not found, return error
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    // Check if password matches
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Check if user is verified
    if (!user.verified) {
      return res.status(403).json({ error: 'Account not verified' });
    }

    const token = generateToken(user);

    // If credentials are correct and user is verified, return success message
    res.status(200).json({ message: 'Login successful', token, user });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});





  //data set
  app.post('/api/data', authenticateUser, async (req, res) => {
  try {
    console.log(req.body.userId)

 
    // Data creation logic here
    const newData = await DataModel.create(req.body);
    res.json(newData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});



// Endpoint to fetch all modal data for a specific user
app.get('/api/data/:userId', authenticateUser, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find all data entries associated with the given userId
    const userData = await DataModel.find({ userId });

    res.status(200).json(userData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

//delete an item


app.delete('/api/data/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    // Find the data item by its ID and delete it
    const deletedItem = await DataModel.findByIdAndDelete(id);

    if (!deletedItem) {
      // If the item doesn't exist, return a 404 status code
      return res.status(404).json({ error: 'Data item not found' });
    }

    // If deletion is successful, return a success message
    res.json({ message: 'Data item deleted successfully' });
  } catch (error) {
    console.error('Error deleting data item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.put('/api/data/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const newData = req.body;

    // Find the data item by its ID and update it with the new data
    const updatedItem = await DataModel.findByIdAndUpdate(id, newData, { new: true });

    if (!updatedItem) {
      // If the item doesn't exist, return a 404 status code
      return res.status(404).json({ error: 'Data item not found' });
    }

    // If update is successful, return the updated item
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating data item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
