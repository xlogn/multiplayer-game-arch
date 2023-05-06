import { Kafka } from "kafkajs";
import { logger } from "./logger.js";
import { GROUPS, TOPICS } from "../constants/kafka.js";
import {  readFromRedis, writeToRedis } from "./redisUtil.js";
import { TrafficUpdate } from "../models/traffic.js";
import { GAME_TYPE } from "../models/gameType.js";

export const kafka = new Kafka({
    clientId: 'multiplyer',
    brokers: ['localhost:9092']
});

const producer = kafka.producer();
await producer.connect();


export async function publishDataToKafka(data: string, topic: string) {
    await producer.send({
        topic: topic,
        messages: [
            { value: data }
        ]
    });
}

export async function publishDataForAPinCode(pinCode: number) {
    const [battleRoyal, captureTheFlag, teamDeathMatch] = await Promise.all([
        readFromRedis(pinCode, GAME_TYPE.BATTLE_ROYAL), 
        readFromRedis(pinCode, GAME_TYPE.CAPTURE_THE_FLAG),
        readFromRedis(pinCode, GAME_TYPE.TEAM_DEATH_MATCH)
    ]) ;
    const data = {};
    data[GAME_TYPE.BATTLE_ROYAL] = battleRoyal;
    data[GAME_TYPE.CAPTURE_THE_FLAG] = captureTheFlag;
    data[GAME_TYPE.TEAM_DEATH_MATCH] = teamDeathMatch;
    logger.info(JSON.stringify(data));
}




/*Consumer for UPDATE_TRAFFIC traffic topic*/
const trafficUpdateConsumer = kafka.consumer({ groupId: GROUPS.TRAFFIC });
await trafficUpdateConsumer.connect();
await trafficUpdateConsumer.subscribe({ topic: TOPICS.UPDATE_TRAFFIC });
// Start consuming messages from the subscribed topic
await trafficUpdateConsumer.run({
    eachMessage: async ({ topic, partition, message }) => {
        logger.info(`Received message from topic ${topic}, partition ${partition}: ${message.value.toString()}`);
        const data = JSON.parse(message.value.toString());
        const updateTrafficData : TrafficUpdate = {pinCode: data.pinCode, gameType: data.gameType, delta: data.delta}
        await writeToRedis(updateTrafficData.pinCode,updateTrafficData.gameType, updateTrafficData.delta);
        publishDataForAPinCode(updateTrafficData.pinCode);
    }
});