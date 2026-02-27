import { gql } from "@apollo/client";

export const GET_LESSON_COMMENTS = gql`
  query GetLessonComments($lessonId: String!) {
    lessonComments(lessonId: $lessonId) {
      id
      content
      userId
      parentId
      createdAt
      user { id email }
      replies {
        id
        content
        userId
        parentId
        createdAt
        user { id email }
      }
    }
  }
`;

export const CREATE_COMMENT = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      id
      content
      userId
      lessonId
      parentId
      createdAt
      user { id email }
      replies {
        id content userId parentId createdAt
        user { id email }
      }
    }
  }
`;

export const DELETE_COMMENT = gql`
  mutation DeleteComment($id: String!) {
    deleteComment(id: $id) { id }
  }
`;
