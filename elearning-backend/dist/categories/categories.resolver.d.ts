import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { CreateCategoryInput } from './dto/create-category.input';
export declare class CategoriesResolver {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    getCategories(): Promise<Category[]>;
    createCategory(input: CreateCategoryInput): Promise<Category>;
    deleteCategory(id: string): Promise<Category>;
}
