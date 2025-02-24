const mongoose = require('mongoose');

const amendeSchema = new mongoose.Schema({
  plaque: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: new Date(),
  },
  
  montant: {
    type: Number,
    required: true,
  },
  status: {
    type: Boolean,
    default: false,
  },
});

// Middleware pour mettre à jour la date et l'heure avant chaque sauvegarde
amendeSchema.pre('save', function(next) {
  if (!this.date) {
    this.date = new Date();
  }
  if (!this.heure) {
    const now = new Date();
    this.heure = now.toTimeString().split(' ')[0]; // Format HH:MM:SS
  }
  next();
});

module.exports = mongoose.model('Amende', amendeSchema);
