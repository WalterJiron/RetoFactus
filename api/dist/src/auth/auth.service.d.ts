import { SignInDto } from './dto/signIn.dto';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private readonly db;
    private readonly jwtService;
    constructor(db: DataSource, jwtService: JwtService);
    signIn({ email, password }: SignInDto): Promise<{
        accessToken: string;
    }>;
    private createTocken;
}
