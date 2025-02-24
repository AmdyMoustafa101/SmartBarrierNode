const express = require('express');
const router = express.Router();
const Amende = require('../models/Amende');

// Route pour créer une nouvelle amende
router.post('/', async (req, res) => {
  const { plaque, montant } = req.body;

  try {
    const nouvelleAmende = new Amende({ plaque, montant });
    await nouvelleAmende.save();
    res.status(201).json(nouvelleAmende);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la création de l\'amende', error: error.message });
  }
});

// Route pour obtenir toutes les amendes
router.get('/', async (req, res) => {
  try {
    const amendes = await Amende.find();
    res.json(amendes);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des amendes', error: error.message });
  }
});

// Route pour mettre à jour une amende
router.patch('/:id', async (req, res) => {
  const { status } = req.body;

  try {
    const amende = await Amende.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!amende) {
      return res.status(404).json({ message: 'Amende non trouvée' });
    }
    res.json(amende);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour de l\'amende', error: error.message });
  }
});

// Route pour supprimer une amende
router.delete('/:id', async (req, res) => {
  try {
    const amende = await Amende.findByIdAndDelete(req.params.id);
    if (!amende) {
      return res.status(404).json({ message: 'Amende non trouvée' });
    }
    res.json({ message: 'Amende supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'amende', error: error.message });
  }
});

module.exports = router;
