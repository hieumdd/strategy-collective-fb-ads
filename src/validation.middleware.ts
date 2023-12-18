import { Handler } from 'express';
import Joi from 'joi';

import { logger } from './logging.service';

export const createValidationMiddleware = (schema: Joi.Schema): Handler => {
    return (req, res, next) => {
        schema
            .validateAsync(req.body, { abortEarly: false })
            .then((value) => {
                logger.debug({ value });
                req.body = value;
                next();
            })
            .catch((error) => {
                logger.warn({ error });
                res.status(400).json({ error });
            });
    };
};
