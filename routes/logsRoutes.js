const express = require('express');
const Log = require('../models/Logs');
const router = express.Router();



// Route pour enregistrer la connexion de l'utilisateur
router.post('/login', async (req, res) => {
  try {
    const { userId } = req.body;
    const log = new Log({ userId });
    await log.save();
    res.status(200).json({ message : 'Connexion enregistrée'});
  } catch (error) {
    res.status(500).json({ error : "Erreur lors de l'enrigistrement"});
  }
});

// Route pour enregistrer les actions de l'utilisateur
router.post('/log-action', async (req, res) => {
    const { userId, type, entity, entityId, details } = req.body;
    const log = await Log.findOne({ userId, logoutTime: null });
    if (log) {
      log.actions.push({ type, entity, entityId, details });
      await log.save();
      res.status(200).json({ mesage : 'Action enregistrée'});
    } else {
      res.status(404).json({ error : 'Utilisateur non connecté'});
    }
  });
  
  //Route pour recuperer les logs
  router.get('/', async (req, res) => {
    const logs = await Log.find({ logoutTime: { $ne: null } });
    if (logs) {
      res.status(200).json(logs);
    } else {
      res.status(404).json({ error : 'Aucun log trouvé'});
    }
  });
  
  // Route pour récupérer le log correspondant à une date de logout donnée pour un user specifique
  router.get('/:userId/:logoutTime', async (req, res) => {
    const { userId, logoutTime } = req.params;
    const log = await Log.findOne({ userId, logoutTime });
    if (log) {
      res.status(200).json(log.actions);
    } else {
      res.status(404).json({ error : 'Log non trouvé'});
    }
  });
  

  // Route pour récupérer le log correspondant à une date de login donnée pour un user specifique

 
  
 
  
  // Route pour enregistrer la déconnexion de l'utilisateur
  router.post('/logout', async (req, res) => {
    const { userId } = req.body;
    const log = await Log.findOne({ userId, logoutTime: null });
    if (log) {
      log.logoutTime = new Date();
      await log.save();
      res.status(200).json({ mesage : 'Déconnexion enregistrée'});
    } else {
      res.status(404).json({ error : 'Utilisateur non connecté'});
    }
  });
  
  
  module.exports = router;