const express = require('express');
const router = express.Router();
const Voiture = require('../models/Voiture');

// Create a new voiture
router.post('/', async (req, res) => {
  try {
    const voiture = new Voiture(req.body);
    await voiture.save();
    res.status(201).send(voiture);
  } catch (error) {
    if (error.code === 11000) { // Code d'erreur pour les violations d'unicité
      if (error.keyPattern.plaque) {
        return res.status(400).json({ message: 'Cette plaque est déjà utilisée.' });
      }
    }
    res.status(400).send(error);
  }
});

// Get all voitures
router.get('/', async (req, res) => {
  try {
    const voitures = await Voiture.find();
    res.status(200).send(voitures);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Route pour obtenir toutes les voitures recherchées
router.get('/recherchees', async (req, res) => {
  try {
    // Récupérer les voitures où estCible est true
    const voituresRecherchees = await Voiture.find({ estCible: true });
    res.json(voituresRecherchees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a voiture by ID
router.get('/:id', async (req, res) => {
  try {
    const voiture = await Voiture.findById(req.params.id);
    if (!voiture) {
      return res.status(404).send();
    }
    res.status(200).send(voiture);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update a voiture
router.patch('/:id', async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['plaque', 'modele', 'contact', 'archived', 'estCible', 'organisme'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const voiture = await Voiture.findById(req.params.id);
    if (!voiture) {
      return res.status(404).send();
    }

    updates.forEach(update => voiture[update] = req.body[update]);
    await voiture.save();
    res.send(voiture);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern.plaque) {
      return res.status(400).json({ message: 'Cette plaque est déjà utilisée.' });
    }
    res.status(400).send(error);
  }
});

// Archive a voiture
router.patch('/archive/:id', async (req, res) => {
  try {
    const voiture = await Voiture.findById(req.params.id);
    if (!voiture) {
      return res.status(404).send();
    }

    voiture.archived = true;
    await voiture.save();
    res.send(voiture);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Route pour désarchiver une voiture
router.patch('/unarchive/:id', async (req, res) => {
  try {
    const voiture = await Voiture.findById(req.params.id);
    if (!voiture) {
      return res.status(404).send();
    }

    voiture.archived = false;
    await voiture.save();
    res.send(voiture);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Route pour créer une voiture recherchée
router.post('/recherchees', async (req, res) => {
  try {
    const { plaque, modele, contact } = req.body;
    const nouvelleVoiture = new Voiture({
      plaque,
      modele,
      contact,
      organisme: 'recherché',
      estCible: true
    });
    await nouvelleVoiture.save();
    res.status(201).json(nouvelleVoiture);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Route pour supprimer une voiture recherchée
router.delete('/recherchees/:id', async (req, res) => {
  try {
    const voiture = await Voiture.findByIdAndDelete(req.params.id);
    if (!voiture) return res.status(404).json({ message: 'Voiture non trouvée' });
    res.json({ message: 'Voiture supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route pour archiver une voiture recherchée
router.patch('/recherchees/archiver/:id', async (req, res) => {
  try {
    const voiture = await Voiture.findById(req.params.id);
    if (!voiture) return res.status(404).json({ message: 'Voiture non trouvée' });
    voiture.archived = true;
    await voiture.save();
    res.json(voiture);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;