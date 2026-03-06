import { Type } from '@nestjs/common';
import { ObjectType, Field, Int } from '@nestjs/graphql';

/**
 * Factory function that creates a generic PaginatedResult ObjectType
 * for any given GraphQL entity class.
 *
 * Usage:
 *   const PaginatedCourseResult = createPaginatedResultType(Course);
 *
 * This generates a GraphQL type like:
 *   type PaginatedCourseResult {
 *     items: [Course!]!
 *     totalCount: Int!
 *     hasMore: Boolean!
 *   }
 */
export interface IPaginatedResult<T> {
    items: T[];
    totalCount: number;
    hasMore: boolean;
}

export function createPaginatedResultType<T>(
    classRef: Type<T>,
): Type<IPaginatedResult<T>> {
    @ObjectType(`Paginated${classRef.name}Result`, { isAbstract: false })
    class PaginatedResult implements IPaginatedResult<T> {
        @Field(() => [classRef])
        items: T[];

        @Field(() => Int)
        totalCount: number;

        @Field()
        hasMore: boolean;
    }

    return PaginatedResult as Type<IPaginatedResult<T>>;
}
