const mongoose = require('mongoose');

// Définir un schéma pour les factures
const factureSchema = new mongoose.Schema({
  idVoiture: String,
  heurePassage: Date,
  montant: Number,
});

// Créer un modèle basé sur le schéma
const Facture = mongoose.model('Facture', factureSchema);

module.exports = Facture;
