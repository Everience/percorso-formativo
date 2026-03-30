const UserModel = require('../models/userModel');
const CourseModel = require('../models/courseModel'); 


const ROLE_TO_DB = { dev: 'dev-user', tech: 'tech-user', admin: 'admin' };
const ROLE_FROM_DB = { 'dev-user': 'dev', 'tech-user': 'tech', admin: 'admin' };

function mapRoleFromDB(user) {
    if (!user) return user;
    const key = (user.role == null ? '' : String(user.role)).trim().toLowerCase();
    const role = ROLE_FROM_DB[key] ?? user.role;
    return { ...user, role };
}

function cleanTitle(title) {
    return (title || '').toString().replace(/\\n|\n/g, ' ').replace(/\s+/g, ' ').trim();
}


/** Fixed page size for this list (do not read `limit` from query — avoids bad/duplicate params). */
const ADMIN_USERS_PAGE_SIZE = 12;

function parsePositiveInt(raw, fallback) {
    if (raw === undefined || raw === null || raw === '') return fallback;
    const v = Array.isArray(raw) ? raw[raw.length - 1] : raw;
    const n = parseInt(String(v), 10);
    return Number.isFinite(n) && n > 0 ? n : fallback;
}

exports.getAllUsersPaginated = async (req, res) => {
    try {
        const page = parsePositiveInt(req.query.page, 1);
        const limit = ADMIN_USERS_PAGE_SIZE;

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

        /** Same formula as dashboard KPI: dev_count + tech_count (not raw COUNT drift). */
        const cohort = await UserModel.getCohortCounts(searchQuery);
        const appUsersTotal = Number(cohort.dev_count) + Number(cohort.tech_count);

        const totalItems = Number(await UserModel.countAdminUsers(searchQuery, roleFilter));
        const useCohortForPaging =
            !roleFilter && !String(searchQuery || '').trim();
        const paginationTotal = useCohortForPaging ? appUsersTotal : totalItems;
        if (useCohortForPaging && totalItems !== appUsersTotal) {
            console.error(
                '[admin] users list COUNT vs cohort mismatch',
                { totalItems, appUsersTotal },
            );
        }
        const totalPages =
            paginationTotal === 0 ? 0 : Math.ceil(paginationTotal / limit);
        let effectivePage = page;
        if (totalPages > 0 && effectivePage > totalPages) effectivePage = totalPages;
        const offset = (effectivePage - 1) * limit;

        const rawUsers = await UserModel.findAdminUsers(searchQuery, roleFilter, offset, limit, sortColumn, sortOrder);
        const users = rawUsers.filter((u) => UserModel.isAppUserRole(u.role));
        if (users.length !== rawUsers.length) {
            console.error('[admin] findAdminUsers returned non-app roles; stripped from response');
        }

        res.status(200).json({
            data: users.map(mapRoleFromDB),
            meta: {
                totalItems: Math.trunc(totalItems),
                appUsersTotal: Math.trunc(appUsersTotal),
                appUsersByRole: {
                    dev: Math.trunc(Number(cohort.dev_count) || 0),
                    tech: Math.trunc(Number(cohort.tech_count) || 0),
                },
                currentPage: effectivePage,
                totalPages,
                limit: ADMIN_USERS_PAGE_SIZE,
            },
        });
    } catch (error) {
        console.error('Errore Admin Users:', error);
        res.status(500).json({ message: 'Errore nel recupero degli utenti' });
    }
};

exports.getUserDetail = async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id);
        if (!user || !UserModel.isAppUserRole(user.role)) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

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

        const existing = await UserModel.findById(userId);
        if (!existing || !UserModel.isAppUserRole(existing.role)) {
            return res.status(404).json({ message: 'Utente non trovato' });
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
        if (!user || !UserModel.isAppUserRole(user.role)) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        const progress = await CourseModel.findWithProgressByUserId(userId);
        const primaryCategory = user.role === 'dev-user' ? 'DEV' : 'TECH';
        const sorted = progress
            .map(item => ({
                ...item,
                title: cleanTitle(item.title),
                category: (item.category || '').toString().toUpperCase(),
            }))
            .sort((a, b) => {
                const aRank = a.category === primaryCategory ? 0 : 1;
                const bRank = b.category === primaryCategory ? 0 : 1;
                if (aRank !== bRank) return aRank - bRank;
                if (a.position_row !== b.position_row) return a.position_row - b.position_row;
                return a.display_order - b.display_order;
            });

        res.status(200).json(sorted);
    } catch (error) {
        console.error('Errore Admin User Progress:', error);
        res.status(500).json({ message: 'Errore nel recupero del progresso utente' });
    }
};