import { WishlistService } from './wishlist.service';
export declare class WishlistResolver {
    private readonly wishlistService;
    constructor(wishlistService: WishlistService);
    getMyWishlist(user: {
        id: string;
    }): Promise<any>;
    isInWishlist(courseId: string, user: {
        id: string;
    }): Promise<boolean>;
    addToWishlist(courseId: string, user: {
        id: string;
    }): Promise<any>;
    removeFromWishlist(courseId: string, user: {
        id: string;
    }): Promise<boolean>;
}
