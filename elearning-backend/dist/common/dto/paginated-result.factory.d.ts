import { Type } from '@nestjs/common';
export interface IPaginatedResult<T> {
    items: T[];
    totalCount: number;
    hasMore: boolean;
}
export declare function createPaginatedResultType<T>(classRef: Type<T>): Type<IPaginatedResult<T>>;
