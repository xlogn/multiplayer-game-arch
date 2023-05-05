import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';

async function initServer() {
    // Load .env file
    dotenv.config();
    const port = process.env.PORT || 3000;
    
    const app: Express = express();
    app.get('/', (req: Request, res: Response) => {
        res.send({ message: 'pong' });
    });
    app.listen(port, () => {
        logger.info(`⚡️[server]: Server is running at http://localhost:${port}`);
    });
  
}

initServer();
