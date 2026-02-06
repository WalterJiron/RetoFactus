import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { DataSource } from 'typeorm';
export declare class RolesService {
    private readonly db;
    constructor(db: DataSource);
    create({ name, description }: CreateRoleDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: number): Promise<any>;
    update(id: number, { name, description }: UpdateRoleDto): Promise<any>;
    remove(id: number): Promise<any>;
    restore(id: number): Promise<any>;
}
