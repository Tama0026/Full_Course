import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { CreateCategoryInput } from './dto/create-category.input';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Resolver(() => Category)
export class CategoriesResolver {
    constructor(private readonly categoriesService: CategoriesService) { }

    /**
     * Get all categories (public — no auth required).
     */
    @Query(() => [Category], { name: 'categories' })
    async getCategories(): Promise<Category[]> {
        return this.categoriesService.findAll() as unknown as Category[];
    }

    /**
     * Create a new category (Instructor or Admin).
     */
    @Mutation(() => Category)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.INSTRUCTOR, Role.ADMIN)
    async createCategory(
        @Args('input') input: CreateCategoryInput,
    ): Promise<Category> {
        return this.categoriesService.create(input.name) as unknown as Category;
    }

    /**
     * Delete a category (Admin only).
     */
    @Mutation(() => Category)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async deleteCategory(@Args('id') id: string): Promise<Category> {
        return this.categoriesService.delete(id) as unknown as Category;
    }
}
