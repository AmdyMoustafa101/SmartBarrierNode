const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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

// Hacher le mot de passe avant de sauvegarder l'utilisateur
userSchema.pre('save', async function(next) {
  if (!this.isModified('motDePasse')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
  next();
});

// Mettre à jour la date de mise à jour avant chaque sauvegarde
userSchema.pre('save', function(next) {
  this.dateMaj = Date.now();
  next();
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.motDePasse);
};

module.exports = mongoose.model('User', userSchema);
