// routes/voiture.js
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

module.exports = router;
