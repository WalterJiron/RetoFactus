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
            ca: string | undefined;
        };
        options: {
            encrypt: boolean;
            trustServerCertificate: boolean;
        };
        synchronize: boolean;
        autoLoadEntities: boolean;
    };
};
export default _default;
