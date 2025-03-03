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
function noticeByMail(voiture) {
  // code pour envoyer l'email
  const mailOptions = {
    from: 'ouzealdiey24@gmail.com', // Remplacez par votre email
    to: voiture.contact, // Email du contact
    subject: 'Voiture Retrouvée!',
    text: `Bonjour, \n\nUne voiture ayant été rcapturée sur l'Autoroute.\n\nVoici les informations de cette voiture : \n- Plaque : ${voiture.plaque} \n- Modèle : ${voiture.modele} \n- Contact : ${voiture.contact} \n`
   
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log('Erreur lors de l\'envoi de l\'email :', error);
    }
    console.log('Email envoyé :', info.response);
  });
}

//fonction pour envoyer un email automatique apres la facturation d'une voiture
function factMail(voiture, montant) {
  // code pour envoyer l'email
  const mailOptions = {
    from: 'ouzealdiey24@gmail.com',
    to: voiture.contact,
    subject: 'Facturation',
    text: `Bonjour, \n\nVotre facture pour la voiture ${voiture.plaque} a été générée.\n\nVoici les informations de cette facture : \n- Plaque : ${voiture.plaque} \n- Modèle : ${voiture.modele} \n- Montant : ${montant} \n`
    // code pour ajouter le lien de téléchargement de la facture
    // mailOptions.attachments = [{ filename: 'facture.pdf', path: '/path/to/facture.pdf' }]
  }
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log('Erreur lors de l\'envoi de l\'email :', error);
    }
    console.log('Email envoyé :', info.response);
  
  })
}


module.exports = {
  sendNewUserEmail,
  noticeByMail,
  factMail
};
