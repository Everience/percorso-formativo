const CourseModel = require('../models/courseModel');
const UserModel = require('../models/userModel');
const MAX_COURSES_PER_ROW = 4;

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

exports.getCourseCompletions = async (req, res) => {
    try {
        const courseId = Number(req.params.id);
        if (!Number.isInteger(courseId) || courseId < 1) {
            return res.status(400).json({ message: 'ID corso non valido' });
        }
        const course = await CourseModel.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Corso non trovato' });

        const rawRows = await CourseModel.findCompletionRowsByCourseId(courseId);
        const rows = rawRows.filter((r) => UserModel.isAppUserRole(r.role));
        if (rows.length !== rawRows.length) {
            console.error('[admin] completion rows included non-app roles; stripped from response');
        }
        let completed = 0;
        let inProgress = 0;
        let notStarted = 0;
        for (const row of rows) {
            const s = (row.status || 'not_started').toString();
            if (s === 'completed') completed += 1;
            else if (s === 'in_progress') inProgress += 1;
            else notStarted += 1;
        }
        const total = rows.length;

        res.status(200).json({
            course: {
                id: course.id,
                title: course.title,
                description: course.description,
                category: (course.category || '').toString().toUpperCase(),
                position_row: course.position_row,
                display_order: course.display_order,
            },
            summary: {
                total,
                completed,
                inProgress,
                notStarted,
            },
            rows: rows.map((r) => ({
                user_id: r.user_id,
                first_name: r.first_name,
                last_name: r.last_name,
                email: r.email,
                role: r.role,
                status: (r.status || 'not_started').toString(),
            })),
        });
    } catch (error) {
        console.error('Errore Admin Course Completions:', error);
        res.status(500).json({ message: 'Errore nel recupero degli avanzamenti' });
    }
};

exports.createCourse = async (req, res) => {
    try {
        const { title, category } = req.body;
        
        if (!title || !category) {
            return res.status(400).json({ message: 'Titolo e categoria sono obbligatori' });
        }

        const targetCategory = (category || '').toUpperCase();
        const targetRow = Number(req.body.position_row) || 1;
        const rowCount = await CourseModel.countCoursesInRow(targetCategory, targetRow);
        if (rowCount >= MAX_COURSES_PER_ROW) {
            return res.status(400).json({ message: `Riga ${targetRow} piena: massimo ${MAX_COURSES_PER_ROW} corsi` });
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
        const courseId = Number(req.params.id);
        const current = await CourseModel.findById(courseId);
        if (!current) return res.status(404).json({ message: 'Corso non trovato' });

        const targetCategory = (req.body.category ?? current.category ?? '').toString().toUpperCase();
        const targetRow = Number(req.body.position_row ?? current.position_row);
        const rowCount = await CourseModel.countCoursesInRow(targetCategory, targetRow, courseId);
        if (rowCount >= MAX_COURSES_PER_ROW) {
            return res.status(400).json({ message: `Riga ${targetRow} piena: massimo ${MAX_COURSES_PER_ROW} corsi` });
        }

        const success = await CourseModel.updateCourse(courseId, req.body);
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

exports.reorderResources = async (req, res) => {
    try {
        const courseId = req.params.id;
        const { orderedIds } = req.body;
        await CourseModel.reorderResources(courseId, orderedIds);
        res.status(200).json({ message: 'Ordine risorse aggiornato' });
    } catch (error) {
        console.error('Errore Admin Reorder Resources:', error);
        res.status(500).json({ message: 'Errore nel riordinamento delle risorse' });
    }
};
