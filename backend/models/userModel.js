const { sql, poolPromise } = require('../config/db');

const ROLE_NORM_SQL = "LOWER(LTRIM(RTRIM(ISNULL(role, ''))))";
const APP_USER_ROLES_CLAUSE = `${ROLE_NORM_SQL} IN ('dev-user', 'tech-user')`;

class UserModel {
    static isAppUserRole(role) {
        const r = (role == null ? '' : String(role)).trim().toLowerCase();
        return r === 'dev-user' || r === 'tech-user';
    }
    static async findById(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Users WHERE id = @id');
        return result.recordset[0];
    }

    static async findByUid(uid) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('uid', sql.NVarChar, uid)
            .query('SELECT * FROM Users WHERE uid = @uid');
        return result.recordset[0];
    } 

   static async addUserToDB(userData) {
        const { firstName, lastName, email, role, uid } = userData;
        const pool = await poolPromise;

        const query = `
            INSERT INTO Users (first_name, last_name, email, role, uid)
            VALUES (
                @firstName, 
                @lastName, 
                @email, 
                @role, 
                @uid
            );
            SELECT SCOPE_IDENTITY() AS id; 
        `;
        
        const result = await pool.request()
            .input('firstName', sql.NVarChar, firstName)
            .input('lastName', sql.NVarChar, lastName)
            .input('email', sql.NVarChar, email)
            .input('role', sql.NVarChar, role) 
            .input('uid', sql.NVarChar, uid)
            .query(query);

        return result.recordset[0].id;
    }

    static async countAdminUsers(searchQuery, roleFilter) {
        const pool = await poolPromise;
        const request = pool.request();
        let query = `SELECT COUNT(*) as total FROM Users WHERE ${APP_USER_ROLES_CLAUSE}`;

        if (searchQuery) {
            query += ' AND (first_name LIKE @search OR last_name LIKE @search OR email LIKE @search)';
            request.input('search', sql.NVarChar, `%${searchQuery}%`);
        }
        if (roleFilter) {
            query += ` AND ${ROLE_NORM_SQL} = @roleNorm`;
            request.input('roleNorm', sql.NVarChar, String(roleFilter).trim().toLowerCase());
        }

        const result = await request.query(query);
        const raw = result.recordset[0]?.total;
        return Math.trunc(Number(raw ?? 0) || 0);
    }

    static async findAdminUsers(searchQuery, roleFilter, offset, limit, sortColumn, sortOrder) {
        const pool = await poolPromise;
        const request = pool.request();
        let query = `SELECT id, first_name, last_name, email, role, uid FROM Users WHERE ${APP_USER_ROLES_CLAUSE}`;

        if (searchQuery) {
            query += ' AND (first_name LIKE @search OR last_name LIKE @search OR email LIKE @search)';
            request.input('search', sql.NVarChar, `%${searchQuery}%`);
        }
        if (roleFilter) {
            query += ` AND ${ROLE_NORM_SQL} = @roleNorm`;
            request.input('roleNorm', sql.NVarChar, String(roleFilter).trim().toLowerCase());
        }

        const validColumns = ['id', 'first_name', 'last_name', 'email', 'role'];
        const orderCol = validColumns.includes(sortColumn) ? sortColumn : 'id';
        const orderDir = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        query += ` ORDER BY ${orderCol} ${orderDir} OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
        
        request.input('offset', sql.Int, offset);
        request.input('limit', sql.Int, limit);

        const result = await request.query(query);
        return result.recordset;
    }

    static async getCohortCounts(searchQuery) {
        const pool = await poolPromise;
        const request = pool.request();
        let query = `
            SELECT
                SUM(CASE WHEN ${ROLE_NORM_SQL} = 'dev-user' THEN 1 ELSE 0 END) AS dev_count,
                SUM(CASE WHEN ${ROLE_NORM_SQL} = 'tech-user' THEN 1 ELSE 0 END) AS tech_count,
                COUNT(*) AS total
            FROM Users
            WHERE ${APP_USER_ROLES_CLAUSE}`;
        if (searchQuery) {
            query += ' AND (first_name LIKE @search OR last_name LIKE @search OR email LIKE @search)';
            request.input('search', sql.NVarChar, `%${searchQuery}%`);
        }
        const result = await request.query(query);
        const row = result.recordset[0] || {};
        const dev = Math.trunc(Number(row.dev_count ?? 0) || 0);
        const tech = Math.trunc(Number(row.tech_count ?? 0) || 0);
        const total = dev + tech;
        return { dev_count: dev, tech_count: tech, total };
    }

    static async getAnalytics() {
        return this.getCohortCounts('');
    }

    static async updateRole(userId, newRole) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, userId)
            .input('role', sql.NVarChar, newRole)
            .query('UPDATE Users SET role = @role WHERE id = @id');
        return result.rowsAffected[0] > 0;
    }
}

module.exports = UserModel;