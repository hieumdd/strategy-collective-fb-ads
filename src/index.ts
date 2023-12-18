import express from 'express';
import bodyParser from 'body-parser';

import { logger } from './logging.service';
import {
    CreatePipelineTasksBody,
    CreatePipelineTasksBodySchema,
    RunPipelineBody,
    RunPipelineBodySchema,
} from './pipeline/pipeline.request.dto';
import * as pipelines from './pipeline/pipeline.const';
import { runPipeline, createInsightsPipelineTasks } from './pipeline/pipeline.service';
import { createValidationMiddleware } from './validation.middleware';

const app = express();

app.use(bodyParser.json());

app.use(({ method, path, body }, res, next) => {
    logger.info({ method, path, body });
    res.on('finish', () => {
        logger.debug({ method, path, body, status: res.statusCode });
    });
    next();
});

app.use('/task', createValidationMiddleware(CreatePipelineTasksBodySchema), (req, res) => {
    const body = req.body as CreatePipelineTasksBody;

    createInsightsPipelineTasks(body)
        .then((result) => res.status(200).json({ result }))
        .catch((error) => {
            logger.error({ error });
            res.status(500).json({ error });
        });
});

app.use('/', createValidationMiddleware(RunPipelineBodySchema), (req, res) => {
    const body = req.body as RunPipelineBody;

    return runPipeline(pipelines[body.pipeline], {
        accountId: body.accountId,
        start: body.start,
        end: body.end,
    })
        .then((result) => res.status(200).json({ result }))
        .catch((error) => {
            logger.error({ error });
            res.status(500).json({ error });
        });
});

app.listen(8080);
