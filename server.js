const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const voitureRouter = require('./routes/voitureRoutes');
const logsRoutes = require('./routes/logsRoutes');
const amendeRoutes = require('./routes/amendeRoutes');
const { router: authRoutes, authMiddleware } = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT ;

// Connexion à MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', authMiddleware, userRoutes);
app.use('/api/voitures', authMiddleware, voitureRouter);
app.use('/api/logs', logsRoutes);
app.use('/api/amendes', authMiddleware, amendeRoutes);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
