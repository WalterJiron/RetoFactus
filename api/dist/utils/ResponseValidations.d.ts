interface DatabaseResponse {
    message: string;
}
interface ValidationResponse {
    message: string;
    status: number;
    data?: any;
}
export declare class ResponseValidation {
    static forMessage(resultData: DatabaseResponse[] | any, messageValidate: string): ValidationResponse | any;
}
export {};
