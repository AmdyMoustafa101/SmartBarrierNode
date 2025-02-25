const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assurez-vous d'importer votre modèle User
const RevokedToken = require('../models/RevokedToken'); // Importer le modèle RevokedToken
const router = express.Router();

// Middleware pour vérifier le token
const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Accès non autorisé' });
  }

  try {
    const decoded = jwt.verify(token, 'votre_secret_key');
    console.log('Decoded Token:', decoded);

    // Vérifier si le token est révoqué
    const isRevoked = await RevokedToken.findOne({ token });
    if (isRevoked) {
      return res.status(401).json({ message: 'Token révoqué' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token Verification Error:', error);
    res.status(401).json({ message: 'Token invalide' });
  }
};

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

    // Tester si l'utilisateur est bloqué
    if (user.archived) {
      return res.status(403).json({ message: 'Utilisateur bloqué' });
    }

    const token = jwt.sign({ userId: user._id }, 'votre_secret_key', { expiresIn: '1h' });
    console.log('Generated Token:', token);
    res.json({ token, user });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route de déconnexion
router.post('/logout', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Accès non autorisé' });
  }

  try {
    // Ajouter le token à la liste des tokens révoqués
    const revokedToken = new RevokedToken({ token });
    await revokedToken.save();

    res.json({ message: 'Déconnexion réussie' });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = { router, authMiddleware };
