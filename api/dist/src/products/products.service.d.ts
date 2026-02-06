import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsService {
    create(createProductDto: CreateProductDto): Promise<string>;
    findAll(): Promise<string>;
    findOne(id: number): Promise<string>;
    update(id: number, updateProductDto: UpdateProductDto): Promise<string>;
    remove(id: number): Promise<string>;
    restore(id: number): Promise<string>;
}
