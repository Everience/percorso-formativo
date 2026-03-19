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
            query += ' WHERE LOWER(category) = @category';
            request.input('category', sql.NVarChar, category.toLowerCase());
        }

        query += ' ORDER BY position_row ASC, display_order ASC';
        
        const result = await request.query(query);
        return result.recordset;
    }

    static async findResourcesByCourseId(courseId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('courseId', sql.Int, courseId)
            .query('SELECT * FROM Resources WHERE course_id = @courseId ORDER BY sort_order ASC, id ASC');
        
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
            ORDER BY c.category ASC, c.position_row ASC, c.display_order ASC
        `;

        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .query(query);

        return result.recordset;
    }

    static async countAdminCourses(category, searchQuery) {
        const pool = await poolPromise;
        const request = pool.request();
        let query = 'SELECT COUNT(*) as total FROM Courses WHERE 1=1';

        if (category) {
            query += ' AND LOWER(category) = @category';
            request.input('category', sql.NVarChar, category.toLowerCase());
        }
        if (searchQuery) {
            query += ' AND (title LIKE @search OR description LIKE @search)';
            request.input('search', sql.NVarChar, `%${searchQuery}%`);
        }

        const result = await request.query(query);
        return result.recordset[0].total;
    }

    static async findAdminCourses(category, searchQuery, offset, limit, sortColumn, sortOrder) {
        const pool = await poolPromise;
        const request = pool.request();
        let query = 'SELECT * FROM Courses WHERE 1=1';

        if (category) {
            query += ' AND LOWER(category) = @category';
            request.input('category', sql.NVarChar, category.toLowerCase());
        }
        if (searchQuery) {
            query += ' AND (title LIKE @search OR description LIKE @search)';
            request.input('search', sql.NVarChar, `%${searchQuery}%`);
        }

        query += ` ORDER BY category ASC, position_row ASC, display_order ASC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
        
        request.input('offset', sql.Int, offset);
        request.input('limit', sql.Int, limit);

        const result = await request.query(query);
        return result.recordset;
    }

    static async countCoursesInRow(category, positionRow, excludeId = null) {
        const pool = await poolPromise;
        const request = pool.request()
            .input('category', sql.NVarChar, (category || '').toUpperCase())
            .input('positionRow', sql.Int, positionRow);

        let query = `
            SELECT COUNT(*) as total
            FROM Courses
            WHERE UPPER(category) = @category
              AND position_row = @positionRow
        `;

        if (excludeId !== null) {
            query += ' AND id <> @excludeId';
            request.input('excludeId', sql.Int, excludeId);
        }

        const result = await request.query(query);
        return result.recordset[0]?.total ?? 0;
    }

    static async createCourse(data) {
        const pool = await poolPromise;
        const query = `
            INSERT INTO Courses (title, description, category, position_row, display_order)
            VALUES (@title, @description, @category, @position_row, @display_order);
            SELECT SCOPE_IDENTITY() AS id;
        `;
        const result = await pool.request()
            .input('title', sql.NVarChar, data.title)
            .input('description', sql.NVarChar, data.description)
            .input('category', sql.NVarChar, data.category)
            .input('position_row', sql.Int, data.position_row || 1)
            .input('display_order', sql.Int, data.display_order || 1)
            .query(query);
        return result.recordset[0].id;
    }

    static async updateCourse(id, data) {
        const pool = await poolPromise;
        const request = pool.request();
        request.input('id', sql.Int, id);

        let updates = [];
        if (data.title !== undefined) { updates.push('title = @title'); request.input('title', sql.NVarChar, data.title); }
        if (data.description !== undefined) { updates.push('description = @description'); request.input('description', sql.NVarChar, data.description); }
        if (data.category !== undefined) { updates.push('category = @category'); request.input('category', sql.NVarChar, data.category); }
        if (data.position_row !== undefined) { updates.push('position_row = @position_row'); request.input('position_row', sql.Int, data.position_row); }
        if (data.display_order !== undefined) { updates.push('display_order = @display_order'); request.input('display_order', sql.Int, data.display_order); }

        if (updates.length === 0) return true; 

        const query = `UPDATE Courses SET ${updates.join(', ')} WHERE id = @id`;
        const result = await request.query(query);
        return result.rowsAffected[0] > 0;
    }

    static async deleteCourse(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Courses WHERE id = @id');
        return result.rowsAffected[0] > 0;
    }

    static async createResource(courseId, data) {
        const pool = await poolPromise;
        const query = `
            INSERT INTO Resources (course_id, title, platform, video_url, sort_order)
            VALUES (@courseId, @title, @platform, @video_url, @sort_order);
            SELECT SCOPE_IDENTITY() AS id;
        `;
        const result = await pool.request()
            .input('courseId', sql.Int, courseId)
            .input('title', sql.NVarChar, data.title)
            .input('platform', sql.NVarChar, data.platform)
            .input('video_url', sql.NVarChar, data.video_url)
            .input('sort_order', sql.Int, data.sort_order || 1)
            .query(query);
        return result.recordset[0].id;
    }

    static async updateResource(resourceId, data) {
        const pool = await poolPromise;
        const request = pool.request();
        request.input('id', sql.Int, resourceId);

        let updates = [];
        if (data.title !== undefined) { updates.push('title = @title'); request.input('title', sql.NVarChar, data.title); }
        if (data.platform !== undefined) { updates.push('platform = @platform'); request.input('platform', sql.NVarChar, data.platform); }
        if (data.video_url !== undefined) { updates.push('video_url = @video_url'); request.input('video_url', sql.NVarChar, data.video_url); }
        if (data.sort_order !== undefined) { updates.push('sort_order = @sort_order'); request.input('sort_order', sql.Int, data.sort_order); }

        if (updates.length === 0) return true;

        const query = `UPDATE Resources SET ${updates.join(', ')} WHERE id = @id`;
        const result = await request.query(query);
        return result.rowsAffected[0] > 0;
    }

    static async deleteResource(resourceId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, resourceId)
            .query('DELETE FROM Resources WHERE id = @id');
        return result.rowsAffected[0] > 0;
    }

    static async getAnalytics() {
        const pool = await poolPromise;

        const categoriesResult = await pool.request().query(`
            SELECT
                SUM(CASE WHEN UPPER(category) = 'DEV' THEN 1 ELSE 0 END) as dev_count,
                SUM(CASE WHEN UPPER(category) = 'TECH' THEN 1 ELSE 0 END) as tech_count,
                COUNT(*) as total
            FROM Courses
        `);

        const statsResult = await pool.request().query(`
            SELECT
                c.id, c.title, c.category, c.description, c.position_row, c.display_order,
                SUM(CASE WHEN up.status = 'completed' THEN 1 ELSE 0 END) as completed_count,
                SUM(CASE WHEN up.status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_count,
                SUM(CASE WHEN up.status = 'not_started' THEN 1 ELSE 0 END) as not_started_count
            FROM Courses c
            LEFT JOIN UserProgress up ON c.id = up.course_id
            GROUP BY c.id, c.title, c.category, c.description, c.position_row, c.display_order
            ORDER BY c.category ASC, c.position_row ASC, c.display_order ASC
        `);

        return {
            categories: categoriesResult.recordset[0],
            courseStats: statsResult.recordset,
        };
    }

    static async reorderResources(courseId, orderedIds) {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        try {
            for (let i = 0; i < orderedIds.length; i++) {
                const request = new sql.Request(transaction);
                await request
                    .input('id', sql.Int, orderedIds[i])
                    .input('newOrder', sql.Int, i + 1)
                    .input('courseId', sql.Int, courseId)
                    .query('UPDATE Resources SET sort_order = @newOrder WHERE id = @id AND course_id = @courseId');
            }
            await transaction.commit();
            return true;
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
}

module.exports = CourseModel;
