// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
  },
  prenom: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  motDePasse: {
    type: String,
    required: true,
  },
  telephone: {
    type: String,
    required: true,
    unique: true,
  },
  archived: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ['administrateur', 'agent'],
    required: true,
  },
  organisme: {
    type: String,
    enum: ['police', 'gendarmerie', 'ambulance'],
    required: function() {
      return this.role === 'agent';
    },
  },
  dateCreation: {
    type: Date,
    default: Date.now,
  },
  dateMaj: {
    type: Date,
    default: Date.now,
  },
});

// Mettre à jour la date de mise à jour avant chaque sauvegarde
userSchema.pre('save', function (next) {
  this.dateMaj = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);