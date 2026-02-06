import { CategorysService } from './categorys.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategorysController {
    private readonly categorysService;
    constructor(categorysService: CategorysService);
    create(createCategoryDto: CreateCategoryDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: number): Promise<any>;
    update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<any>;
    remove(id: number): Promise<any>;
    restore(id: number): Promise<any>;
}
