const { sql, poolPromise } = require('../config/db');

class UserModel {
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

        // Query che inserisce l'utente e converte automaticamente il ruolo in ID
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
        let query = 'SELECT COUNT(*) as total FROM Users WHERE 1=1';

        if (searchQuery) {
            query += ' AND (first_name LIKE @search OR last_name LIKE @search OR email LIKE @search)';
            request.input('search', sql.NVarChar, `%${searchQuery}%`);
        }
        if (roleFilter) {
            query += ' AND role = @role';
            request.input('role', sql.NVarChar, roleFilter);
        }

        const result = await request.query(query);
        return result.recordset[0].total;
    }

    static async findAdminUsers(searchQuery, roleFilter, offset, limit, sortColumn, sortOrder) {
        const pool = await poolPromise;
        const request = pool.request();
        let query = 'SELECT id, first_name, last_name, email, role, uid FROM Users WHERE 1=1';

        if (searchQuery) {
            query += ' AND (first_name LIKE @search OR last_name LIKE @search OR email LIKE @search)';
            request.input('search', sql.NVarChar, `%${searchQuery}%`);
        }
        if (roleFilter) {
            query += ' AND role = @role';
            request.input('role', sql.NVarChar, roleFilter);
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