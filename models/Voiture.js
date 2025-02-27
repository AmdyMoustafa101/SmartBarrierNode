// models/Voiture.js
const mongoose = require('mongoose');

const voitureSchema = new mongoose.Schema({
  plaque: { type: String, required: true },
  modele: { type: String, required: true },
  contact: {type: String, required: true},
  telephone: {
    type: String,
    required: function() {
      return this.organisme === 'recherché';
    },
  },
  archived: { type: Boolean, default: false },
  estCible: { type: Boolean, default: false },
  organisme: { type: String, enum: ['police', 'gendarmerie', 'ambulance'], required: false },
  dateCreation: {
    type: Date,
    default: Date.now,
  },
  dateMaj: {
    type: Date,
    required: false,
  },
});


const Voiture = mongoose.model('Voiture', voitureSchema);

module.exports = Voiture;
