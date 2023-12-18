import express, { NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { ValidatedRequest, createValidator } from 'express-joi-validation';
import Joi from 'joi';

import { logger } from './logging.service';
import * as pipelines from './pipeline/pipeline.const';
import { runPipeline, createInsightsPipelineTasks } from './pipeline/pipeline.service';
import {
    CreatePipelineTasksBodySchema,
    CreatePipelineTasksRequest,
    RunPipelineBodySchema,
    RunPipelineRequest,
} from './pipeline/pipeline.request.dto';

const app = express();
const validator = createValidator({ passError: true, joi: { stripUnknown: true } });

app.use(bodyParser.json());

app.use(({ method, path, body }, res, next) => {
    logger.info({ method, path, body });
    res.on('finish', () => {
        logger.debug({ method, path, body, status: res.statusCode });
    });
    next();
});

app.use(
    '/task',
    validator.body(CreatePipelineTasksBodySchema),
    ({ body }: ValidatedRequest<CreatePipelineTasksRequest>, res, next) => {
        createInsightsPipelineTasks(body)
            .then((result) => res.status(200).json({ result }))
            .catch(next);
    },
);

app.use(
    '/',
    validator.body(RunPipelineBodySchema),
    ({ body }: ValidatedRequest<RunPipelineRequest>, res, next) => {
        runPipeline(pipelines[body.pipeline], {
            accountId: body.accountId,
            start: body.start,
            end: body.end,
        })
            .then((result) => res.status(200).json({ result }))
            .catch(next);
    },
);

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    if (Joi.isError(error.error)) {
        logger.warn({ error: error.error });
        res.status(400).json({ error: error.error });
        return;
    }

    logger.error({ error });
    res.status(500).json({ error });
});

app.listen(8080);
