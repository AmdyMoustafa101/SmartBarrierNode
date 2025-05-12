const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const Voiture = require('./models/Voiture');
const Amende = require('./models/Amende');
const Facture = require('./models/Facture');
const Payement = require('./models/Payement');
const { factMail } = require('./services/emailService');
require('dotenv').config();

const PORT = process.env.PORT_FLUX ;

// Connexion à MongoDB
connectDB();

const app = express();

// Cache pour éviter les doublons (10 secondes)
const recentPlates = new Map();
const CACHE_DURATION = 10000; // 10 secondes
const MONTANT_AMENDE_DEFAUT = 100; // Montant par défaut pour les amendes

app.use(cors());
app.use(bodyParser.json());

function normalizePlate(plate) {
  return plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

app.post('/receive-plate', async (req, res) => {
  try {
    const { plate } = req.body;

    if (!plate) {
      return res.status(400).json({ 
        error: 'Aucune plaque reçue',
        command: -1
      });
    }

    const cleanPlate = normalizePlate(plate);

    // Vérification du cache
    if (recentPlates.has(cleanPlate)) {
      console.log(`Plaque déjà traitée récemment: ${cleanPlate}`);
      return res.status(200).json({
        command: 3,
        message: 'Plaque déjà traitée récemment'
      });
    }

    // Ajouter au cache et programmation suppression
    recentPlates.set(cleanPlate, Date.now());
    setTimeout(() => recentPlates.delete(cleanPlate), CACHE_DURATION);

    // Validation format plaque
    const plaqueRegex = /^[A-Z]{2}\d{3,4}[A-Z]{2}$/;
    if (!plaqueRegex.test(cleanPlate)) {
      return res.status(400).json({
        command: -1,
        error: 'Format de plaque invalide. Formats acceptés : AA000AB ou AA0000AB'
      });
    }

    // Recherche de la voiture
    const voiture = await Voiture.findOne({ plaque: cleanPlate });

    if (!voiture) {
      try {
        const nouvelleAmende = new Amende({ 
          plaque: cleanPlate,
          montant: MONTANT_AMENDE_DEFAUT
        });
        
        await nouvelleAmende.save();
        return res.status(200).json({ 
          command: 0,
          exists: false,
          message: 'Plaque non reconnue - Amende créée'
        });
      } catch (error) {
        console.error('Erreur création amende:', error);
        return res.status(500).json({
          command: -1,
          error: 'Échec de la création d\'amende'
        });
      }
    }

    if (voiture.estCible) {
      return res.status(200).json({ 
        command: 2,
        exists: true,
        message: 'Véhicule ciblé - Accès refusé'
      });
    }

    if (voiture.organisme) {
      try {
        const payement = await Payement.findOne({ organisme: voiture.organisme });
        
        if (!payement) {
          return res.status(400).json({
            command: -1,
            error: 'Configuration de paiement manquante'
          });
        }

        const facture = new Facture({
          idVoiture: voiture._id,
          heurePassage: new Date(),
          montant: payement.montant
        });

        await facture.save();

        try {
          await factMail(voiture, payement.montant);
        } catch (emailError) {
          console.error('Échec envoi email:', emailError);
        }

        return res.status(200).json({
          command: 1,
          exists: true,
          montant: payement.montant,
          message: 'Facture créée et email envoyé'
        });

      } catch (error) {
        console.error('Erreur traitement organisme:', error);
        return res.status(500).json({
          command: -1,
          error: 'Erreur de traitement de l\'organisme'
        });
      }
    }

    return res.status(400).json({
      command: -1,
      error: 'Cas non géré par le système'
    });

  } catch (err) {
    console.error('Erreur globale:', err);
    return res.status(500).json({
      command: -1,
      error: 'Erreur serveur interne'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});