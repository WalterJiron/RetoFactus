import { SubCategoryService } from './sub_category.service';
import { CreateSubCategoryDto } from './dto/create-sub_category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub_category.dto';
export declare class SubCategoryController {
    private readonly subCategoryService;
    constructor(subCategoryService: SubCategoryService);
    create(createSubCategoryDto: CreateSubCategoryDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updateSubCategoryDto: UpdateSubCategoryDto): Promise<any>;
    remove(id: string): Promise<any>;
    restore(id: number): Promise<any>;
}
