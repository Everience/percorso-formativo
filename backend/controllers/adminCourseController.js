const CourseModel = require('../models/courseModel');

exports.getAllCoursesPaginated = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const searchQuery = req.query.q || '';
        const category = req.query.category || '';
        const sort = req.query.sort || 'position_row'; 
        
        let sortColumn = sort;
        let sortOrder = 'ASC';
        if (sort.startsWith('-')) {
            sortOrder = 'DESC';
            sortColumn = sort.substring(1);
        }

        const offset = (page - 1) * limit;

        const totalItems = await CourseModel.countAdminCourses(category, searchQuery);
        const courses = await CourseModel.findAdminCourses(category, searchQuery, offset, limit, sortColumn, sortOrder);

        res.status(200).json({
            data: courses,
            meta: {
                totalItems,
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                limit
            }
        });
    } catch (error) {
        console.error('Errore Admin Get Courses:', error);
        res.status(500).json({ message: 'Errore nel recupero dei corsi' });
    }
};

exports.getCourseDetail = async (req, res) => {
    try {
        const course = await CourseModel.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Corso non trovato' });
        res.status(200).json(course);
    } catch (error) {
        console.error('Errore Admin Course Detail:', error);
        res.status(500).json({ message: 'Errore del server' });
    }
};

exports.createCourse = async (req, res) => {
    try {
        const { title, description, category, position_row, display_order } = req.body;
        
        if (!title || !category) {
            return res.status(400).json({ message: 'Titolo e categoria sono obbligatori' });
        }

        const newId = await CourseModel.createCourse(req.body);
        res.status(201).json({ message: 'Corso creato', id: newId });
    } catch (error) {
        console.error('Errore Admin Create Course:', error);
        res.status(500).json({ message: 'Errore nella creazione del corso' });
    }
};

exports.updateCourse = async (req, res) => {
    try {
        const success = await CourseModel.updateCourse(req.params.id, req.body);
        if (!success) return res.status(404).json({ message: 'Corso non trovato' });
        res.status(200).json({ message: 'Corso aggiornato' });
    } catch (error) {
        console.error('Errore Admin Update Course:', error);
        res.status(500).json({ message: 'Errore nell\'aggiornamento del corso' });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const success = await CourseModel.deleteCourse(req.params.id);
        if (!success) return res.status(404).json({ message: 'Corso non trovato' });
        res.status(200).json({ message: 'Corso eliminato' });
    } catch (error) {
        console.error('Errore Admin Delete Course:', error);
        res.status(500).json({ message: 'Errore nell\'eliminazione (assicurati che non abbia risorse collegate)' });
    }
};

exports.getCourseResources = async (req, res) => {
    try {
        const resources = await CourseModel.findResourcesByCourseId(req.params.id);
        res.status(200).json(resources);
    } catch (error) {
        console.error('Errore Admin Get Resources:', error);
        res.status(500).json({ message: 'Errore nel recupero risorse' });
    }
};

exports.createResource = async (req, res) => {
    try {
        const courseId = req.params.id;
        const { title, platform, video_url } = req.body;

        if (!title || !video_url) {
            return res.status(400).json({ message: 'Titolo e URL sono obbligatori' });
        }

        const newId = await CourseModel.createResource(courseId, req.body);
        res.status(201).json({ message: 'Risorsa creata', id: newId });
    } catch (error) {
        console.error('Errore Admin Create Resource:', error);
        res.status(500).json({ message: 'Errore nella creazione della risorsa' });
    }
};

exports.updateResource = async (req, res) => {
    try {
        const success = await CourseModel.updateResource(req.params.resourceId, req.body);
        if (!success) return res.status(404).json({ message: 'Risorsa non trovata' });
        res.status(200).json({ message: 'Risorsa aggiornata' });
    } catch (error) {
        console.error('Errore Admin Update Resource:', error);
        res.status(500).json({ message: 'Errore nell\'aggiornamento della risorsa' });
    }
};

exports.deleteResource = async (req, res) => {
    try {
        const success = await CourseModel.deleteResource(req.params.resourceId);
        if (!success) return res.status(404).json({ message: 'Risorsa non trovata' });
        res.status(200).json({ message: 'Risorsa eliminata' });
    } catch (error) {
        console.error('Errore Admin Delete Resource:', error);
        res.status(500).json({ message: 'Errore nell\'eliminazione della risorsa' });
    }
};