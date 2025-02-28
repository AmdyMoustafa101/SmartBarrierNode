const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Voiture = require('./models/Voiture');

const app = express();

// Connexion à MongoDB
/*mongoose.connect('mongodb://localhost:27017/SmartBarrier', { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log('Connecté à MongoDB'))
.catch(err => console.error('Erreur de connexion MongoDB:', err));

// Schéma du modèle Voiture
const voitureSchema = new mongoose.Schema({
  plaque: {
    type: String,
    required: true,
    unique: true,
    match: [/^[A-Z]{2}\d{3,4}[A-Z]{2}$/, 'Format de plaque invalide']
  },
  marque: String,
  modele: String,
  proprietaire: String,
  // Ajoutez d'autres champs selon vos besoins
});

// Modèle Voiture
const Voiture = mongoose.model('Voiture', voitureSchema);
*/
// Middleware
app.use(cors());
app.use(bodyParser.json());

// Fonction de normalisation des plaques
function normalizePlate(plate) {
  return plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

// Endpoint de réception des plaques
app.post('/receive-plate', async (req, res) => {
  try {
    const receivedPlate = req.body.plate;
    
    if (!receivedPlate) {
      return res.status(400).json({ error: 'Aucune plaque reçue' });
    }

    // Normalisation de la plaque
    const cleanPlate = normalizePlate(receivedPlate);
    console.log('Plaque reçue:', cleanPlate);

    // Validation du format
    if (!/^[A-Z]{2}\d{3,4}[A-Z]{2}$/.test(cleanPlate)) {
      return res.status(400).json({ error: 'Format de plaque invalide' });
    }

    // Recherche dans la base de données
    const voiture = await Voiture.findOne({ plaque: cleanPlate });

    res.json({
      plaque: cleanPlate,
      existe: !!voiture,
      details: voiture || null,
      message: voiture 
        ? 'Plaque trouvée dans la base de données' 
        : 'Plaque non reconnue'
    });

  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});