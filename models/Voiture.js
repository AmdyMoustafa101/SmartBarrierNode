// models/Voiture.js
const mongoose = require('mongoose');

const voitureSchema = new mongoose.Schema({
  plaque: { type: String, required: true, unique: true, },
  modele: { type: String, required: true },
  contact: {type: String, required: true},
  archived: { type: Boolean, default: false },
  estCible: { type: Boolean, default: false },
  dateMaj: { type: Date, required: false },
  organisme: { type: String, enum: ['police', 'gendarmerie', 'ambulance'], required: false }
});

const Voiture = mongoose.model('Voiture', voitureSchema);

module.exports = Voiture;
