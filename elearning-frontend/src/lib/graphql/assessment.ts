import { gql } from "@apollo/client";

export const GET_INSTRUCTOR_ASSESSMENTS = gql`
  query GetInstructorAssessments {
    assessments {
      id
      title
      description
      timeLimit
      passingScore
      numberOfSets
      isActive
      type
      enrollCode
      createdAt
    }
  }
`;

export const GET_STUDENT_ASSESSMENTS_WITH_ATTEMPTS = gql`
  query GetStudentAssessmentsWithAttempts {
    assessments {
      id
      title
      isActive
      attempts {
        id
        score
        status
      }
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
      numberOfSets
      type
      enrollCode
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
      numberOfSets
      maxAttempts
      maxViolations
      totalPoints
      isPublished
      isActive
      type
      enrollCode
      questions {
        id
        setCode
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
      setCode
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
      setCode
      questions {
        id
        prompt
        options
      }
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
      violationCount
      status
      completedAt
    }
  }
`;

export const MY_ATTEMPT_HISTORY = gql`
  query MyAttemptHistory($assessmentId: String!) {
    myAttemptHistory(assessmentId: $assessmentId) {
      id
      setCode
      startedAt
      completedAt
      score
      passed
      isInvalid
      violationCount
      status
      violations {
        type
        timestamp
      }
    }
  }
`;

// ================= NEW EXAM MODULE MUTATIONS =================

export const PUBLISH_ASSESSMENT = gql`
  mutation PublishAssessment($assessmentId: String!) {
    publishAssessment(assessmentId: $assessmentId) {
      id
      isPublished
      questions {
        id
        points
      }
    }
  }
`;

export const UNPUBLISH_ASSESSMENT = gql`
  mutation UnpublishAssessment($assessmentId: String!) {
    unpublishAssessment(assessmentId: $assessmentId) {
      id
      isPublished
    }
  }
`;

export const AUTO_BALANCE_POINTS = gql`
  mutation AutoBalancePoints($assessmentId: String!) {
    autoBalancePoints(assessmentId: $assessmentId) {
      id
      questions {
        id
        points
      }
    }
  }
`;

export const UPDATE_QUESTION_INLINE = gql`
  mutation UpdateQuestionInline($questionId: String!, $input: UpdateQuestionInlineInput!) {
    updateQuestionInline(questionId: $questionId, input: $input) {
      id
      points
      correctAnswer
      difficulty
    }
  }
`;

export const GENERATE_AI_EXAM_QUESTIONS = gql`
  mutation GenerateAiExamQuestions(
    $assessmentId: String!
    $questionCount: Int!
    $bankId: String
    $setCode: String
  ) {
    generateAiExamQuestions(
      assessmentId: $assessmentId
      questionCount: $questionCount
      bankId: $bankId
      setCode: $setCode
    ) {
      id
      questions {
        id
        setCode
        prompt
        options
        correctAnswer
        points
        difficulty
        isAiGenerated
      }
    }
  }
`;

export const ASSESSMENT_REPORT = gql`
  query AssessmentReport($assessmentId: String!) {
    assessmentReport(assessmentId: $assessmentId) {
      totalAttempts
      avgScore
      passRate
      voidedCount
      attempts {
        id
        userId
        userName
        userEmail
        setCode
        startedAt
        completedAt
        score
        passed
        isInvalid
        violationCount
        status
        violations {
          type
          timestamp
        }
      }
    }
  }
`;
