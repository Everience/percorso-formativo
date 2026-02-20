const admin = require('firebase-admin');

async function verificaToken(req, res, next) {

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Accesso negato: Token mancante' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    req.user = decodedToken; 
    next(); 
  } catch (error) {
    console.error('Token non valido:', error);
    return res.status(401).json({ error: 'Accesso negato: Token non valido o scaduto' });
  }
}

module.exports = verificaToken;