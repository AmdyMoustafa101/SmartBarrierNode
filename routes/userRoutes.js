const express = require('express');
const User = require('../models/User');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Récupérer tous les utilisateurs
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Créer un utilisateur
router.post('/users', async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, telephone, role, organisme } = req.body;
    const user = new User({ nom, prenom, email, motDePasse, telephone, role, organisme });
    await user.save();
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

// Supprimer un utilisateur
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



// Route de connexion
router.post('/login', async (req, res) => {
  const { email, motDePasse } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    const isMatch = await user.comparePassword(motDePasse);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    //tester si l'utilisateur est bloquer 
    if (user.archived) {
      return res.status(403).json({ message: 'Utilisateur bloqué' });
    }


    const token = jwt.sign({ userId: user._id }, 'votre_secret_key', { expiresIn: '1h' });
    res.json({ token: token, user: user });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
