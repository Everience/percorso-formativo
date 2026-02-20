const { sql, poolPromise } = require('../config/db');

class CourseModel {
    static async findById(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Courses WHERE id = @id');
        
        return result.recordset[0];
    }

    static async findAll(category) {
        const pool = await poolPromise;
        let query = 'SELECT * FROM Courses';
        
        const request = pool.request();

        if (category) {
            query += ' WHERE category = @category';
            request.input('category', sql.NVarChar, category.toUpperCase());
        }

        query += ' ORDER BY position_row ASC, display_order ASC';
        
        const result = await request.query(query);
        return result.recordset;
    }

    static async findResourcesByCourseId(courseId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('courseId', sql.Int, courseId)
            .query('SELECT * FROM Resources WHERE course_id = @courseId');
        
        return result.recordset;
    }

    static async updateStatus(userId, courseId, status) {
        const pool = await poolPromise;
    
        const query = `
            IF EXISTS (SELECT 1 FROM UserProgress WHERE user_id = @userId AND course_id = @courseId)
            BEGIN
                UPDATE UserProgress 
                SET status = @status 
                WHERE user_id = @userId AND course_id = @courseId;
            END
            ELSE
            BEGIN
                INSERT INTO UserProgress (user_id, course_id, status)
                VALUES (@userId, @courseId, @status);
            END
        `;

        await pool.request()
            .input('userId', sql.Int, userId)
            .input('courseId', sql.Int, courseId)
            .input('status', sql.NVarChar, status)
            .query(query);
            
        return { message: 'Status aggiornato' };
    }

    static async findWithProgressByUserId(userId) {
        const pool = await poolPromise;
        const query = `
            SELECT 
                c.id, 
                c.title, 
                c.description, 
                c.category, 
                c.position_row, 
                c.display_order,
                COALESCE(up.status, 'not_started') as status
            FROM Courses c
            LEFT JOIN UserProgress up ON c.id = up.course_id AND up.user_id = @userId
            ORDER BY c.position_row ASC, c.display_order ASC
        `;
        
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .query(query);
            
        return result.recordset;
    }
}

module.exports = CourseModel;