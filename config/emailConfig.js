const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // Vous pouvez utiliser d'autres services comme 'SendGrid', 'Mailgun', etc.
  auth: {
    user: 'ouzealdiey24@gmail.com', // Remplacez par votre email
    pass: 'pqsy ajwt uymo rdzm ' // Remplacez par votre mot de passe
  }
});

module.exports = transporter;
