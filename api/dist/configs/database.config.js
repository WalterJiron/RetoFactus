"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    database: {
        type: 'postgres',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT, 10),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        extra: {
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        },
        ssl: {
            rejectUnauthorized: true,
            ca: process.env.DB_SSL.replace(/\\n/g, '\n'),
        },
        synchronize: process.env.DB_SYNCHRONIZE === 'true' || false,
        autoLoadEntities: true,
    }
});
//# sourceMappingURL=database.config.js.map