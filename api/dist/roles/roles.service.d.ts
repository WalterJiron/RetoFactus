import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { DataSource } from 'typeorm';
export declare class RolesService {
    private readonly db;
    constructor(db: DataSource);
    create(createRoleDto: CreateRoleDto): string;
    findAll(): Promise<any>;
    findOne(id: number): Promise<any>;
    update(id: number, updateRoleDto: UpdateRoleDto): string;
    remove(id: number): string;
}
