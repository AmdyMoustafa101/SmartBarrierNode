const nodemailer = require('nodemailer');
require('dotenv').config();

// Configuration du transporteur Nodemailer
const email = process.env.EMAIL;
const password = process.env.PASSWORD;

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: email, 
    pass: password,
  }
});

module.exports = transporter;
