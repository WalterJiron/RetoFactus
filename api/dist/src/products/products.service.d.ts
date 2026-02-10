import { DataSource } from 'typeorm';
import { CreateProductFullDto } from './dto/create-product-full.dto';
import { UpdateProductFullDto } from './dto/update-product-full.dto';
import { CreateProductDetailsDto } from './dto/create-prodestDetails.dto';
export declare class ProductsService {
    private readonly db;
    constructor(db: DataSource);
    create({ codeReference, nameProduct, description, idSubCategory, stock, measurementUnit, minStock, purchasePrice, salePrice }: CreateProductFullDto): Promise<any>;
    createDetail(idProduct: number, { minStock, purchasePrice, salePrice }: CreateProductDetailsDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: number): Promise<any>;
    update(id: number, { codeReference, nameProduct, description, idSubCategory, stock, measurementUnit, idDetail, minStock, purchasePrice, salePrice }: UpdateProductFullDto): Promise<any>;
    remove(id: number): Promise<any>;
    restore(id: number): Promise<any>;
}
