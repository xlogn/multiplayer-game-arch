import { Redis } from "ioredis";

const slaves = [
    new Redis({host: 'localhost',  port: 6380}),
    new Redis({host: 'localhost',  port: 6381})
];

const master = new Redis({
    host: 'localhost',
    port: 6379
});

export async function readFromRedis(pinCode: number, gameType: string)  {
    const slave = slaves[Math.floor(Math.random() * slaves.length)];
    const key = `${pinCode}_${gameType}`;
    
    const exists = await slave.exists(key);
    if (exists === 1) {
        return await slave.get(key);
    } else{ 
        await master.set(key, 0);
        return 0;
    }
}

export async function writeToRedis(pinCode: number, gameType: string, delta: number) {
    const key = `${pinCode}_${gameType}`;
    const val = await master.get(key);
    await master.set(key, (Number(val) || 0) + delta);
}

