const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const Voiture = require('./models/Voiture');
const Amende = require('./models/Amende');
const Facture= require('./models/Facture');
const Payement = require('./models/Payement');
const { factMail } = require('./services/emailService');

// Connexion à MongoDB
connectDB();

const app = express();

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

  
    // Recherche dans la base de données
    const voiture = await Voiture.findOne({ plaque: cleanPlate });



    if (voiture) {

      const montant =  await Payement.findOne({organisme: voiture.organisme});


      if(voiture.estCibles == true) {
        return res.status(200).json({ status: 2 });
      } else if(voiture.estCibles == false) {
        if(voiture.organisme != null) {
          const idVoiture = voiture._id;
          const heurePassage = new Date();
          const facture = new Facture({ idVoiture, heurePassage, montant });
          await facture.save();

          factMail(voiture, montant);

          return res.status(200).json({ status: 1 });
        }
      } 
    } else {
      const plaque = cleanPlate;
      
      try {
        const nouvelleAmende = new Amende({ plaque, montant });
        await nouvelleAmende.save();
        res.status(201).json({ status: 0 });
      } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la création de l\'amende', error: error.message });
      }
    }
  
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});