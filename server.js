// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const voitureRouter = require('./routes/voitureRoutes');
const logsRoutes = require('./routes/logsRoutes');
const amendeRoutes = require('./routes/amendeRoutes');


const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connexion à MongoDB
connectDB();

// Routes
app.use('/api', userRoutes);
app.use('/api/voitures', voitureRouter);
app.use('/api/logs', logsRoutes);
app.use('/api/amendes', amendeRoutes);

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});