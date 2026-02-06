import { CreateSubCategoryDto } from './dto/create-sub_category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub_category.dto';
import { DataSource } from 'typeorm';
export declare class SubCategoryService {
    private readonly db;
    constructor(db: DataSource);
    create({ nameSubCategory, description, categorySub }: CreateSubCategoryDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: number): Promise<any>;
    update(id: number, { nameSubCategory, description, categorySub }: UpdateSubCategoryDto): Promise<any>;
    remove(id: number): Promise<any>;
    restore(id: number): Promise<any>;
}
