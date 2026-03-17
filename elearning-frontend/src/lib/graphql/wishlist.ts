import { gql } from "@apollo/client";

export const GET_MY_WISHLIST = gql`
  query GetMyWishlist {
    myWishlist {
      id
      userId
      courseId
      course {
        id
        title
        description
        price
        thumbnail
        category
        averageRating
        reviewCount
        totalDuration
        instructor { id email name }
        sections {
          id title
          lessons { id title duration }
        }
      }
      createdAt
    }
  }
`;

export const IS_IN_WISHLIST = gql`
  query IsInWishlist($courseId: String!) {
    isInWishlist(courseId: $courseId)
  }
`;

export const ADD_TO_WISHLIST = gql`
  mutation AddToWishlist($courseId: String!) {
    addToWishlist(courseId: $courseId) {
      id
      courseId
    }
  }
`;

export const REMOVE_FROM_WISHLIST = gql`
  mutation RemoveFromWishlist($courseId: String!) {
    removeFromWishlist(courseId: $courseId)
  }
`;
