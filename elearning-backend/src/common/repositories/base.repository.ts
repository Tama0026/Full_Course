import { PrismaService } from '../../prisma/prisma.service';

/**
 * Generic Base Repository implementing common CRUD operations.
 * Uses Prisma delegate pattern for type-safe database operations.
 *
 * @template T - The Prisma model type (e.g., User, Course)
 */
export abstract class BaseRepository<T> {
    constructor(
        protected readonly prisma: PrismaService,
        protected readonly modelName: string,
    ) { }

    /**
     * Get the Prisma delegate for the model.
     * This provides type-safe access to model-specific operations.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected get model(): any {
        return (this.prisma as any)[this.modelName];
    }

    /**
     * Find all records with optional filtering and include options.
     */
    async findAll(args?: {
        where?: Record<string, unknown>;
        include?: Record<string, unknown>;
        orderBy?: Record<string, unknown> | Record<string, unknown>[];
        skip?: number;
        take?: number;
    }): Promise<T[]> {
        return this.model.findMany(args);
    }

    /**
     * Find a single record by ID.
     */
    async findById(
        id: string,
        include?: Record<string, unknown>,
    ): Promise<T | null> {
        return this.model.findUnique({
            where: { id },
            include,
        });
    }

    /**
     * Find a single record by custom criteria.
     */
    async findOne(args: {
        where: Record<string, unknown>;
        include?: Record<string, unknown>;
    }): Promise<T | null> {
        return this.model.findFirst(args);
    }

    /**
     * Create a new record.
     */
    async create(data: Record<string, unknown>): Promise<T> {
        return this.model.create({ data });
    }

    /**
     * Update a record by ID.
     */
    async update(
        id: string,
        data: Record<string, unknown>,
    ): Promise<T> {
        return this.model.update({
            where: { id },
            data,
        });
    }

    /**
     * Delete a record by ID.
     */
    async delete(id: string): Promise<T> {
        return this.model.delete({
            where: { id },
        });
    }

    /**
     * Count records with optional filtering.
     */
    async count(where?: Record<string, unknown>): Promise<number> {
        return this.model.count({ where });
    }
}
