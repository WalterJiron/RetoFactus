import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DataSource } from 'typeorm';
export declare class CategorysService {
    private readonly db;
    constructor(db: DataSource);
    create({ nameCategory, description }: CreateCategoryDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: number): Promise<any>;
    update(id: number, { nameCategory, description }: UpdateCategoryDto): Promise<any>;
    remove(id: number): Promise<any>;
    restore(id: number): Promise<any>;
}
