const UserModel = require('../models/userModel');
const CourseModel = require('../models/courseModel'); 


const ROLE_TO_DB = { dev: 'dev-user', tech: 'tech-user', admin: 'admin' };
const ROLE_FROM_DB = { 'dev-user': 'dev', 'tech-user': 'tech', admin: 'admin' };

function mapRoleFromDB(user) {
    if (!user) return user;
    return { ...user, role: ROLE_FROM_DB[user.role] || user.role };
}


exports.getAllUsersPaginated = async (req, res) => {
    try {
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const searchQuery = req.query.q || '';
        const rawRole = req.query.role || '';
        const sort = req.query.sort || 'id'; 
        
        
        const roleFilter = rawRole ? ROLE_TO_DB[rawRole] : null;

        let sortColumn = sort;
        let sortOrder = 'ASC';
        if (sort.startsWith('-')) {
            sortOrder = 'DESC';
            sortColumn = sort.substring(1);
        }

        const offset = (page - 1) * limit;
  
        const totalItems = await UserModel.countAdminUsers(searchQuery, roleFilter);
        
        const users = await UserModel.findAdminUsers(searchQuery, roleFilter, offset, limit, sortColumn, sortOrder);

        res.status(200).json({
            data: users.map(mapRoleFromDB),
            meta: {
                totalItems,
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                limit
            }
        });
    } catch (error) {
        console.error('Errore Admin Users:', error);
        res.status(500).json({ message: 'Errore nel recupero degli utenti' });
    }
};

exports.getUserDetail = async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Utente non trovato' });
        
        res.status(200).json(mapRoleFromDB(user));
    } catch (error) {
        console.error('Errore Admin User Detail:', error);
        res.status(500).json({ message: 'Errore del server' });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const userId = req.params.id;
        const { role } = req.body; 

        if (!role) {
            return res.status(400).json({ message: 'Ruolo mancante nel body' });
        }

        const dbRole = ROLE_TO_DB[role];
        if (!dbRole) {
            return res.status(400).json({ message: 'Ruolo non valido' });
        }

        const success = await UserModel.updateRole(userId, dbRole);
        if (!success) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        res.status(200).json({ message: 'Ruolo utente aggiornato con successo', newRole: role });
    } catch (error) {
        console.error('Errore Admin Update Role:', error);
        res.status(500).json({ message: 'Errore nell\'aggiornamento del ruolo' });
    }
};


exports.getUserProgress = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await UserModel.findById(userId);
        if (!user) return res.status(404).json({ message: 'Utente non trovato' });


        const progress = await CourseModel.findWithProgressByUserId(userId);
        
        res.status(200).json(progress);
    } catch (error) {
        console.error('Errore Admin User Progress:', error);
        res.status(500).json({ message: 'Errore nel recupero del progresso utente' });
    }
};