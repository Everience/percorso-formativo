const Joi = require('joi');

const updateUserRole = Joi.object({
    role: Joi.string().valid('dev', 'tech', 'admin').required().messages({
        'any.required': 'Il ruolo è obbligatorio',
        'any.only': 'Ruolo non valido. Valori ammessi: dev, tech, admin',
    }),
});

const createCourse = Joi.object({
    title: Joi.string().min(1).max(500).required().messages({
        'any.required': 'Il titolo è obbligatorio',
        'string.empty': 'Il titolo non può essere vuoto',
    }),
    description: Joi.string().max(2000).allow('', null).optional(),
    category: Joi.string().valid('DEV', 'TECH').required().messages({
        'any.required': 'La categoria è obbligatoria',
        'any.only': 'Categoria non valida. Valori ammessi: DEV, TECH',
    }),
    position_row: Joi.number().integer().min(1).optional().default(1),
    display_order: Joi.number().integer().min(1).max(4).optional().default(1).messages({
        'number.max': 'Ogni riga può contenere al massimo 4 corsi',
    }),
});

const updateCourse = Joi.object({
    title: Joi.string().min(1).max(500).optional(),
    description: Joi.string().max(2000).allow('', null).optional(),
    category: Joi.string().valid('DEV', 'TECH').optional(),
    position_row: Joi.number().integer().min(1).optional(),
    display_order: Joi.number().integer().min(1).max(4).optional().messages({
        'number.max': 'Ogni riga può contenere al massimo 4 corsi',
    }),
}).min(1).messages({
    'object.min': 'Almeno un campo deve essere fornito per l\'aggiornamento',
});

const createResource = Joi.object({
    title: Joi.string().min(1).max(500).required().messages({
        'any.required': 'Il titolo è obbligatorio',
    }),
    platform: Joi.string().max(100).allow('', null).optional(),
    video_url: Joi.string().required().messages({
        'any.required': 'L\'URL è obbligatorio',
    }),
    sort_order: Joi.number().integer().min(1).optional().default(1),
});

const updateResource = Joi.object({
    title: Joi.string().min(1).max(500).optional(),
    platform: Joi.string().max(100).allow('', null).optional(),
    video_url: Joi.string().optional(),
    sort_order: Joi.number().integer().min(1).optional(),
}).min(1);

const reorderResources = Joi.object({
    orderedIds: Joi.array().items(Joi.number().integer()).min(1).required().messages({
        'any.required': 'La lista degli ID ordinati è obbligatoria',
    }),
});

module.exports = {
    updateUserRole,
    createCourse,
    updateCourse,
    createResource,
    updateResource,
    reorderResources,
};
