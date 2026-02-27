import { gql } from "@apollo/client";

export const GENERATE_QUIZ_WITH_AI = gql`
  mutation GenerateQuizWithAI($lessonId: String!, $count: Int = 5) {
    generateQuizWithAI(lessonId: $lessonId, count: $count) {
      id
      lessonId
      questions {
        id
        content
        options
        correctAnswer
      }
    }
  }
`;

export const GET_QUIZ = gql`
  query GetQuiz($lessonId: String!) {
    getQuiz(lessonId: $lessonId) {
      id
      lessonId
      questions {
        id
        content
        options
      }
    }
  }
`;

export const GET_INSTRUCTOR_QUIZ = gql`
  query GetInstructorQuiz($lessonId: String!) {
    getQuiz(lessonId: $lessonId) {
      id
      lessonId
      questions {
        id
        content
        options
        correctAnswer
      }
    }
  }
`;

export const SUBMIT_QUIZ = gql`
  mutation SubmitQuiz($lessonId: String!, $answers: [QuizAnswerInput!]!) {
    submitQuiz(lessonId: $lessonId, answers: $answers) {
      success
      score
      totalQuestions
      message
    }
  }
`;

export const UPDATE_QUIZ = gql`
  mutation UpdateQuiz($input: UpdateQuizInput!) {
    updateQuiz(input: $input) {
      id
      lessonId
      questions {
        id
        content
        options
        correctAnswer
      }
    }
  }
`;

