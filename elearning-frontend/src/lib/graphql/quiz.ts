import { gql } from "@apollo/client";

export const GENERATE_QUIZ_WITH_AI = gql`
  mutation GenerateQuizWithAI($lessonId: String!) {
    generateQuizWithAI(lessonId: $lessonId) {
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
