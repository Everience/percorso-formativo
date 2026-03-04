const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
/* PRODUCTION */
/*
corsOptions = {
  origin: 'https://everience-percorso-formativo.netlify.app',
};
app.use(cors(corsOptions));
*/
/* DEVELOPMENT */
app.use(cors());

app.use(bodyParser.json());

const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const admin = require('firebase-admin');

/* PRODUCTION */
/*
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
*/
/* DEVELOPMENT */
const serviceAccount = require('./firebase-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('API Training Path Funzionanti');
});

app.listen(PORT, () => {
  console.log(`Server attivo sulla porta ${PORT}`);
});