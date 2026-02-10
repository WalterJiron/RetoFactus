import { ProductsService } from './products.service';
import { CreateProductFullDto } from './dto/create-product-full.dto';
import { UpdateProductFullDto } from './dto/update-product-full.dto';
import { CreateProductDetailsDto } from './dto/create-prodestDetails.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductFullDto): Promise<any>;
    createDetail(idProduct: number, detail: CreateProductDetailsDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: number): Promise<any>;
    update(id: number, updateProductDto: UpdateProductFullDto): Promise<any>;
    remove(id: number): Promise<any>;
    restore(id: number): Promise<any>;
}
