import { ProductsService } from './products.service';
import { CreateProductFullDto } from './dto/create-product-full.dto';
import { UpdateProductFullDto } from './dto/update-product-full.dto';
import { CreateProductDetailsDto } from './dto/create-prodestDetails.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(estId: number, createProductDto: CreateProductFullDto): Promise<any>;
    createDetail(idProduct: number, detail: CreateProductDetailsDto): Promise<any>;
    findAll(estId: number): Promise<any>;
    findOne(estId: number, id: number): Promise<any>;
    update(id: number, updateProductDto: UpdateProductFullDto): Promise<any>;
    remove(estId: number, id: number): Promise<any>;
    restore(estId: number, id: number): Promise<any>;
}
