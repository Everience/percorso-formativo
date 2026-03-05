const admin = require('firebase-admin');
const UserModel = require('../models/userModel');

async function verificaAdmin(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Accesso negato: Token mancante' });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {       
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        
        const user = await UserModel.findByUid(decodedToken.uid);

        if (!user) {
            return res.status(403).json({ error: 'Utente non trovato nel database' });
        }
        if (user.role !== 'admin') {
            return res.status(403).json({ error: 'Accesso negato: Privilegi di amministratore richiesti' });
        }

        req.user = user; 
        next(); 
    } catch (error) {
        console.error('Errore Admin Middleware:', error);
        return res.status(401).json({ error: 'Accesso negato: Token non valido o scaduto' });
    }
}

module.exports = verificaAdmin;