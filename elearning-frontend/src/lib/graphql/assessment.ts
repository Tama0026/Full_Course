import { gql } from "@apollo/client";

export const GET_INSTRUCTOR_ASSESSMENTS = gql`
  query GetInstructorAssessments {
    assessments {
      id
      title
      description
      timeLimit
      passingScore
      isActive
      createdAt
    }
  }
`;

export const CREATE_ASSESSMENT = gql`
  mutation CreateAssessment($input: CreateAssessmentInput!) {
    createAssessment(input: $input) {
      id
      title
      timeLimit
      passingScore
      isActive
    }
  }
`;

export const DELETE_ASSESSMENT = gql`
  mutation DeleteAssessment($id: String!) {
    deleteAssessment(id: $id) {
      id
    }
  }
`;

export const GET_ASSESSMENT_DETAIL = gql`
  query GetAssessmentDetail($id: String!) {
    assessment(id: $id) {
      id
      title
      description
      timeLimit
      passingScore
      isActive
      questions {
        id
        prompt
        options
        correctAnswer
        explanation
        order
      }
    }
  }
`;

export const CREATE_ASSESSMENT_QUESTION = gql`
  mutation CreateAssessmentQuestion($assessmentId: String!, $input: CreateQuestionInput!) {
    createAssessmentQuestion(assessmentId: $assessmentId, input: $input) {
      id
      prompt
      options
      correctAnswer
      order
    }
  }
`;

export const DELETE_ASSESSMENT_QUESTION = gql`
  mutation DeleteAssessmentQuestion($id: String!) {
    deleteAssessmentQuestion(id: $id) {
      id
    }
  }
`;

export const START_ASSESSMENT_ATTEMPT = gql`
  mutation StartAssessmentAttempt($assessmentId: String!) {
    startAssessmentAttempt(assessmentId: $assessmentId) {
      id
      startedAt
      assessmentId
    }
  }
`;

export const SUBMIT_ASSESSMENT_ATTEMPT = gql`
  mutation SubmitAssessmentAttempt($attemptId: String!, $answers: [AnswerInput!]!) {
    submitAssessmentAttempt(attemptId: $attemptId, answers: $answers) {
      id
      score
      passed
      isInvalid
      completedAt
    }
  }
`;
