import { gql } from "@apollo/client";

export const GET_COURSE_REVIEWS = gql`
  query GetCourseReviews($courseId: String!) {
    courseReviews(courseId: $courseId) {
      totalCount
      averageRating
      star5
      star4
      star3
      star2
      star1
      reviews {
        id
        userId
        courseId
        rating
        comment
        user {
          id
          name
          avatar
        }
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_MY_REVIEW = gql`
  query GetMyReview($courseId: String!) {
    myReview(courseId: $courseId) {
      id
      userId
      courseId
      rating
      comment
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_REVIEW = gql`
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) {
      id
      userId
      courseId
      rating
      comment
      user {
        id
        name
        avatar
      }
      createdAt
    }
  }
`;

export const UPDATE_REVIEW = gql`
  mutation UpdateReview($reviewId: String!, $input: UpdateReviewInput!) {
    updateReview(reviewId: $reviewId, input: $input) {
      id
      userId
      courseId
      rating
      comment
      user {
        id
        name
        avatar
      }
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_REVIEW = gql`
  mutation DeleteReview($reviewId: String!) {
    deleteReview(reviewId: $reviewId) {
      id
      courseId
    }
  }
`;
