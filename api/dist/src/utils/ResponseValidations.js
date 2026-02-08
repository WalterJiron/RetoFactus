"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseValidation = void 0;
const common_1 = require("@nestjs/common");
class ResponseValidation {
    static forMessage(resultData, messageValidate) {
        if (!resultData.length)
            throw new common_1.InternalServerErrorException('Error interno al crear el rol');
        const message = resultData[0].message;
        if (!message.toLowerCase().includes(messageValidate.toLowerCase())) {
            throw new common_1.BadRequestException({ message: message, status: 400 });
        }
        return {
            message: message,
            status: 200
        };
    }
}
exports.ResponseValidation = ResponseValidation;
//# sourceMappingURL=ResponseValidations.js.map