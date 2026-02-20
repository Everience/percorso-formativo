const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); 
app.use(bodyParser.json());

const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');


app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);

// Test route
app.get('/', (req, res) => {
    res.send('API Training Path Funzionanti');
});

app.listen(PORT, () => {
    console.log(`Server attivo sulla porta ${PORT}`);
});