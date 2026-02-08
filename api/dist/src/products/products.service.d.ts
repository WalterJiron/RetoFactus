import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { DataSource } from 'typeorm';
export declare class ProductsService {
    private readonly db;
    constructor(db: DataSource);
    create({ codeReference, nameProduct, description, idSubCategory, stock, measurementUnit, }: CreateProductDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: number): Promise<any>;
    update(id: number, { codeReference, nameProduct, description, idSubCategory, stock, measurementUnit, }: UpdateProductDto): Promise<any>;
    remove(id: number): Promise<any>;
    restore(id: number): Promise<any>;
}
