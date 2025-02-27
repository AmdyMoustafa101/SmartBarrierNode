const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

app.post('/api/plates', (req, res) => {
    const plateNumber = req.body.plate;
    console.log('Plaque reçue:', plateNumber);

    // Trait ici la plaque (base de données, logique métier, etc.)

    res.status(200).json({ success: true });
});

app.listen(3000, () => {
    console.log('Server Node.js en écoute sur le port 3000');
});