const transporter = require('../config/emailConfig');

function sendNewUserEmail(user, motDePasse) {
  const mailOptions = {
    from: 'ouzealdiey24@gmail.com', // Remplacez par votre email
    to: user.email, // Email de l'utilisateur
    subject: 'Bienvenue !',
    text: `Bonjour ,\n\nVotre compte a été créé avec succès.\n\nVoici vos informations :\n- Nom : ${user.nom}\n- Prenom : ${user.prenom}\n- Email : ${user.email}\n- Mot de Passe : ${motDePasse}\n- Téléphone : ${user.telephone}\n\nMerci de vous être inscrit ! \n\nPs: Ne partager pas ces Information !!!!`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log('Erreur lors de l\'envoi de l\'email :', error);
    }
    console.log('Email envoyé :', info.response);
  });
}

//fonction pour envoyer un email automatique apres la capture d'une voiture volée
function noticeByMail(contact) {
  // code pour envoyer l'email
  const mailOptions = {
    from: 'ouzealdiey24@gmail.com', // Remplacez par votre email
    to: contact, // Email du contact
    subject: 'Voiture Retrouvée!',
    text: `Bonjour, \n\nNous vous notifions de la capture de votre voiture sur l'autoroute .\n\nVeillez vous rapprocher de l'agent. `
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log('Erreur lors de l\'envoi de l\'email :', error);
    }
    console.log('Email envoyé :', info.response);
  });
}

module.exports = {
  sendNewUserEmail,
  noticeByMail
};
