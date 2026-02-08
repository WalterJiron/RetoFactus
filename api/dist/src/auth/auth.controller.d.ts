import { AuthService } from './auth.service';
import { SignInDto } from './dto/signIn.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signIn(signIn: SignInDto): Promise<{
        accessToken: string;
    }>;
}
