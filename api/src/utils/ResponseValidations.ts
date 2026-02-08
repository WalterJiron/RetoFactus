import { BadRequestException, InternalServerErrorException } from "@nestjs/common";

interface DatabaseResponse {
    message: string;
}

interface ValidationResponse {
    message: string;
    status: number;
    data?: any;
}

export class ResponseValidation {
    /**
     * Valida la respuesta de la base de datos y formatea la respuesta
     * @param resultData - Resultado de la consulta a la base de datos
     * @param messageValidate - mensaje de consulta realizada correctamente
     * @returns Respuesta formateada o lanza una excepción
     */
    static forMessage(
        resultData: DatabaseResponse[] | any,
        messageValidate: string
    ): ValidationResponse | any {
        if (!resultData.length) throw new InternalServerErrorException('Error interno al crear el rol');

        // Obtenemos la respuesta de la base de datos.
        const message: string = resultData[0].message

        if (!message.toLowerCase().includes(messageValidate.toLowerCase())) {
            throw new BadRequestException({ message: message, status: 400 });
        }

        return {
            message: message,
            status: 200
        }
    }

}