function validate(schema, property = 'body') {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            return res.status(400).json({
                message: 'Errore di validazione',
                errors: error.details.map(d => d.message),
            });
        }

        req[property] = value;
        next();
    };
}

module.exports = { validate };
