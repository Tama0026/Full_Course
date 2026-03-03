import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Get all categories, ordered by `order` then `name`.
     */
    async findAll() {
        return this.prisma.category.findMany({
            orderBy: [{ order: 'asc' }, { name: 'asc' }],
        });
    }

    /**
     * Create a new category. Auto-generates slug from name.
     */
    async create(name: string) {
        const slug = this.generateSlug(name);

        // Check for duplicate name or slug
        const existing = await this.prisma.category.findFirst({
            where: { OR: [{ name }, { slug }] },
        });
        if (existing) {
            throw new ConflictException(`Category "${name}" already exists.`);
        }

        // Determine next order value
        const maxOrder = await this.prisma.category.aggregate({
            _max: { order: true },
        });
        const nextOrder = (maxOrder._max.order ?? -1) + 1;

        return this.prisma.category.create({
            data: { name, slug, order: nextOrder },
        });
    }

    /**
     * Delete a category by ID.
     */
    async delete(id: string) {
        return this.prisma.category.delete({ where: { id } });
    }

    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
}
