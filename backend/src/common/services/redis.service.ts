// backend/src/modules/availability/availability.service.ts
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client!: RedisClientType;

    async onModuleInit() {
        this.client = createClient({ url: process.env.REDIS_URL });
        this.client.on('error', (err) => console.error('Redis Client Error', err));
        await this.client.connect();
    }

    async onModuleDestroy() {
        await this.client.disconnect();
    }

    async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }

    async set(
        key: string,
        value: string,
        durationSeconds: number,
    ): Promise<string | null> {
        // Using Redis v4 set with options
        return this.client.set(key, value, { EX: durationSeconds });
    }

    async del(key: string): Promise<number> {
        return this.client.del(key);
    }

    /**
     * Raw client for advanced pipelining
     */
    get clientRaw(): RedisClientType {
        return this.client;
    }
}
