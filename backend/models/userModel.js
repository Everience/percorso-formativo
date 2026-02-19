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
}

module.exports = UserModel;