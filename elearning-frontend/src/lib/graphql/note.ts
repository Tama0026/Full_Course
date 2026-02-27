import { gql } from "@apollo/client";

export const GET_LESSON_NOTES = gql`
  query GetLessonNotes($lessonId: String!) {
    lessonNotes(lessonId: $lessonId) {
      id
      content
      videoTimestamp
      createdAt
    }
  }
`;

export const CREATE_NOTE = gql`
  mutation CreateNote($input: CreateNoteInput!) {
    createNote(input: $input) {
      id
      content
      videoTimestamp
      createdAt
    }
  }
`;

export const UPDATE_NOTE = gql`
  mutation UpdateNote($id: String!, $input: UpdateNoteInput!) {
    updateNote(id: $id, input: $input) {
      id
      content
      videoTimestamp
      createdAt
    }
  }
`;

export const DELETE_NOTE = gql`
  mutation DeleteNote($id: String!) {
    deleteNote(id: $id) { id }
  }
`;
