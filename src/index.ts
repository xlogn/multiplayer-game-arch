import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';
import { publishDataToKafka } from './utils/kafkaUtil.js';
import { TrafficUpdate } from './models/traffic.js';
import { TOPICS } from './constants/kafka.js';

async function initServer() {


    // Load .env file
    dotenv.config();
    const port = process.env.PORT || 3000;
    
    const app: Express = express();
    app.use(express.json());
    
    app.get('/', (req: Request, res: Response) => {
        res.send({ message: 'pong' });
    });

    app.post('/updateTraffic', async (req: Request, res: Response) => {
        const {pinCode, gameType, delta} = req.body;
        const updateTrafficPayLoad : TrafficUpdate = {pinCode: pinCode, gameType: gameType, delta: delta};
        await publishDataToKafka(JSON.stringify(updateTrafficPayLoad), TOPICS.UPDATE_TRAFFIC );
        res.send({message: "ack"});
    });

    app.listen(port, () => {
        logger.info(`⚡️[server]: Server is running at http://localhost:${port}`);
    });
}

initServer();
