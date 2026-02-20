const UserModel = require('../models/userModel');

exports.getUserById = async (req, res) => {
    try {
        const uidFirebase = req.user.uid;
        const user = await UserModel.findByUid(uidFirebase);
        
        if (!user) {
            return res.status(404).json({ message:'Utente non trovato nel DB SQL' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore del server' });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const uidFirebase = req.user.uid;

        if (!uidFirebase) {
            return res.status(400).json({ message: 'UID mancante nel token Firebase' });
        }

        const user = await UserModel.findByUid(uidFirebase);
        
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
        const uidFirebase = req.user.uid;
        const { firstName, lastName, email, role } = req.body;

        if (!uidFirebase || !email) {
            return res.status(400).json({ message: 'Dati mancanti (UID o Email)' });
        }

        const existingUser = await UserModel.findByUid(uidFirebase);
        if (existingUser) {
            return res.status(409).json({ message: 'Utente già registrato nel database' });
        }

        const newUserId = await UserModel.addUserToDB({
            uid: uidFirebase,
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