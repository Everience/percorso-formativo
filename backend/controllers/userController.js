const UserModel = require('../models/userModel');

exports.getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore del server' });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { uid } = req.body; 

        if (!uid) {
            return res.status(400).json({ message: 'UID mancante' });
        }

        const user = await UserModel.findByUid(uid);
        
        if (user) {
            return res.status(200).json(user);
        }

        return res.status(404).json({ message: 'Utente non trovato nel database. Effettua la registrazione.' });

    } catch (error) {
        console.error("Errore login user:", error);
        res.status(500).json({ message: 'Errore durante il login' });
    }
};

//sarebbe il register
exports.addUserToDB = async (req, res) => {
    try {
        const { uid, email, firstName, lastName, role } = req.body;

        if (!uid || !email) {
            return res.status(400).json({ message: 'Dati mancanti (UID o Email)' });
        }

        const existingUser = await UserModel.findByUid(uid);
        if (existingUser) {
            return res.status(409).json({ message: 'Utente già registrato nel database' });
        }

        const newUserId = await UserModel.addUserToDB({
            uid,
            email,
            firstName: firstName || 'Nuovo',
            lastName: lastName || 'Utente',
            role: role || 'dev-user' 
        });
     
        const user = await UserModel.findById(newUserId);
        res.status(201).json(user);

    } catch (error) {
        console.error("Errore addUserToDB:", error);
        res.status(500).json({ message: 'Errore durante il salvataggio dell\'utente' });
    }
};