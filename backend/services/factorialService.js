const axios = require('axios');

const FACTORIAL_API_URL = 'https://api.factorialhr.com/api/2026-01-01/resources/employees/employees';

const checkIfEmployeeExists = async (email) => {
    try {
        let hasNextPage = true;
        let nextCursor = null;

        while (hasNextPage) {
            
            const params = {};
            if (nextCursor) {
                params.after = nextCursor; 
                params.after_id = nextCursor;
            }

            const response = await axios.get(FACTORIAL_API_URL, {
                headers: {
                    'x-api-key': process.env.FACTORIAL_API_KEY,
                    'Accept': 'application/json'
                },
                params: params
            });

            const employeesList = response.data.data;
            
            if (!Array.isArray(employeesList)) {
                throw new Error("Formato dati Factorial imprevisto");
            }

            const employeeFound = employeesList.find(
                emp => emp.email && emp.email.toLowerCase() === email.toLowerCase()
            );

            if (employeeFound) {
                return true; 
            }

            const meta = response.data.meta;
            if (meta && meta.has_next_page && meta.end_cursor) {
                hasNextPage = true;
                nextCursor = meta.end_cursor; 
            } else {
                hasNextPage = false; 
            }
        }
        return false; 

    } catch (error) {
        console.error('Errore comunicazione con Factorial API:', error.message);
        throw new Error('Impossibile verificare l\'identità su Factorial');
    }
};

module.exports = { checkIfEmployeeExists };