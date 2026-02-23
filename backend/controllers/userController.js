const UserModel = require('../models/userModel');

// Maps frontend role names to DB values and vice-versa
const ROLE_TO_DB = { dev: 'dev-user', tech: 'tech-user' };
const ROLE_FROM_DB = { 'dev-user': 'dev', 'tech-user': 'tech', admin: 'admin' };

function mapRoleFromDB(user) {
    if (!user) return user;
    return { ...user, role: ROLE_FROM_DB[user.role] || user.role };
}

exports.getUserById = async (req, res) => {
    try {
        const uidFirebase = req.user.uid;
        const user = await UserModel.findByUid(uidFirebase);

        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato nel DB SQL' });
        }

        res.status(200).json(mapRoleFromDB(user));
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
            return res.status(200).json(mapRoleFromDB(user));
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

        // Convert frontend role ('dev'/'tech') to DB value ('dev-user'/'tech-user')
        const dbRole = ROLE_TO_DB[role];
        if (!dbRole) {
            return res.status(400).json({ message: `Ruolo non valido: ${role}` });
        }

        const newUserId = await UserModel.addUserToDB({
            uid: uidFirebase,
            email,
            firstName: firstName || 'Nuovo',
            lastName: lastName || 'Utente',
            role: dbRole
        });

        const user = await UserModel.findById(newUserId);
        res.status(201).json(mapRoleFromDB(user));

    } catch (error) {
        console.error("Errore addUserToDB:", error);
        res.status(500).json({ message: 'Errore durante il salvataggio dell\'utente' });
    }
};