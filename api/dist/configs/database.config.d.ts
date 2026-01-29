declare const _default: () => {
    database: {
        type: string;
        host: string | undefined;
        port: number;
        username: string | undefined;
        password: string | undefined;
        database: string | undefined;
        extra: {
            max: number;
            idleTimeoutMillis: number;
            connectionTimeoutMillis: number;
        };
        ssl: {
            rejectUnauthorized: boolean;
            ca: string;
        };
        synchronize: boolean;
        autoLoadEntities: boolean;
        logging: string[];
    };
};
export default _default;
