const mongoose = require('mongoose');

// Définir un schéma pour les Payements
const payementSchema = new mongoose.Schema({
  organisme: { type: String, enum: ['police', 'gendarmerie', 'ambulance'], required: false },
  montant: { type: Number, required: true },
 
});

// Créer un modèle basé sur le schéma
const Payement = mongoose.model('Payement', payementSchema);

// Fonction pour enregistrer les paiements
async function enregistrerPaiements() {
  const paiements = [
    { organisme: 'police', montant: 2000 },
    { organisme: 'gendarmerie', montant: 2000 },
    { organisme: 'ambulance', montant: 1000 },
    { organismes: null, montant: 10000 },
    // Ajoutez d'autres paiements ici si nécessaire
  ];

  try {
    for (const paiement of paiements) {
      const nouveauPaiement = new Payement(paiement);
      await nouveauPaiement.save();
      console.log('Paiement enregistré avec succès:', nouveauPaiement);
    }
    // Fermeture de la connexion après l'enregistrement
    mongoose.connection.close();
  } catch (err) {
    console.error('Erreur lors de l\'enregistrement des paiements:', err);
  }
}

// Lancer la fonction d'enregistrement des paiements
//enregistrerPaiements();

module.exports = Payement;