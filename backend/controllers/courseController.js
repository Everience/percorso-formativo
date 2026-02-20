const CourseModel = require('../models/courseModel');
const UserModel = require('../models/userModel');

// Get All Courses
exports.getAllCourses = async (req, res) => {
    try {
        const category = req.query.category;
        const courses = await CourseModel.findAll(category);
        res.status(200).json(courses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore nel recupero corsi' });
    }
};

// Get Course By ID
exports.getCourseById = async (req, res) => {
    try {
        const course = await CourseModel.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Corso non trovato' });
        res.status(200).json(course);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore del server' });
    }
};

// Get Resources By Course ID
exports.getResourcesByCourse = async (req, res) => {
    try {
        const resources = await CourseModel.findResourcesByCourseId(req.params.id);
        res.status(200).json(resources);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore nel recupero risorse' });
    }
};

//getUserDashboard
exports.getUserDashboard = async (req, res) => {
    try {
        const uidFirebase = req.user.uid;

        const user = await UserModel.findByUid(uidFirebase);
        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato nel database' });
        }

        const dashboardData = await CourseModel.findWithProgressByUserId(user.id);
        
        res.status(200).json(dashboardData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore nel recupero della dashboard' });
    }
};

exports.updateCourseStatus = async (req, res) => {
    try {
        const courseId = req.params.id;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: 'Dati mancanti (status)' });
        }

        const validStatuses = ['not_started', 'in_progress', 'completed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Status non valido' });
        }

        const uidFirebase = req.user.uid;
        
        const user = await UserModel.findByUid(uidFirebase);
        
        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }
        await CourseModel.updateStatus(user.id, courseId, status);

        res.status(200).json({ message: 'Stato aggiornato con successo' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore aggiornamento status' });
    }
};