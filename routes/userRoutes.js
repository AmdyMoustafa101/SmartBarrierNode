const express = require('express');
const User = require('../models/User');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { sendNewUserEmail } = require('../services/emailService');

// Récupérer tous les utilisateurs
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// Fonction pour générer un mot de passe
function generatePassword(nom, prenom) {
  const randomDigits = Math.floor(1000 + Math.random() * 9000); // Génère 4 chiffres aléatoires
  return `${nom}${prenom}@${randomDigits}`;
}

// Fonction pour envoyer un email
async function sendEmail(user, plainPassword) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'taphisllefa@gmail.com', // Remplacez par votre email
      pass: 'tfkc hian kkid igqs' // Remplacez par votre mot de passe
    }
  });

  const mailOptions = {
    from: 'taphisllefa@gmail.com',
    to: user.email,
    subject: 'Vos informations de connexion à SmartBarrier',
    text: `Bonjour ${user.prenom} ${user.nom},\n\nVos informations de connexion sont les suivantes :\n\nNom : ${user.nom}\nPrénom : ${user.prenom}\nTéléphone : ${user.telephone}\nMot de passe : ${plainPassword}\nRôle : ${user.role}\nOrganisme : ${user.organisme}\n\nCordialement,\nVotre équipe`
  };

  await transporter.sendMail(mailOptions);
}

// Créer un utilisateur
router.post('/users', async (req, res) => {
  try {
    const { nom, prenom, email, telephone, role, organisme } = req.body;
    const plainPassword = generatePassword(nom, prenom);

    // Si le rôle est "administrateur", définir l'organisme sur "Smart Barriere"
    const finalOrganisme = role === 'administrateur' ? 'Smart Barriere' : organisme;

    const user = new User({ nom, prenom, email, motDePasse: plainPassword, telephone, role, organisme: finalOrganisme });
    await user.save();
    await sendEmail(user, plainPassword);
    res.status(201).json(user);
  } catch (error) {
    if (error.code === 11000) { // Code d'erreur pour les violations d'unicité
      if (error.keyPattern.email) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
      }
      if (error.keyPattern.telephone) {
        return res.status(400).json({ message: 'Ce numéro de téléphone est déjà utilisé.' });
      }
    }
    res.status(400).json({ message: error.message });
  }
});

// Modifier un utilisateur
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom, email, telephone, role, organisme } = req.body;
    const user = await User.findByIdAndUpdate(
      id,
      { nom, prenom, email, telephone, role, organisme },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (error) {
    if (error.code === 11000) { // Code d'erreur pour les violations d'unicité
      if (error.keyPattern.email) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
      }
      if (error.keyPattern.telephone) {
        return res.status(400).json({ message: 'Ce numéro de téléphone est déjà utilisé.' });
      }
    }
    res.status(400).json({ message: error.message });
  }
});

// Archiver un utilisateur
router.put('/users/:id/archive', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(
      id,
      { archived: true },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Désarchiver un utilisateur
router.put('/users/:id/unarchive', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(
      id,
      { archived: false },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


//route pour supprimés les users
router.delete('/users/:id', async (req, res) => {
  try {
    const users = await User.deleteMany({});
    res.json({ message: 'Tous les utilisateurs ont été supprimés avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Ajoutez cette route dans votre fichier de routes
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Aucun utilisateur trouvé avec cet email.' });
    }

    const plainPassword = generatePassword(user.nom, user.prenom);
    user.motDePasse = plainPassword;
    await user.save();
    await sendEmail(user, plainPassword);

    res.status(200).json({ message: 'Un nouveau mot de passe a été envoyé à votre email.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


module.exports = router;
