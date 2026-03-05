import { gql } from '@apollo/client';

export const GET_MY_QUESTION_BANKS = gql`
  query GetMyQuestionBanks {
    myQuestionBanks {
      id
      name
      description
      category
      questionCount
      createdAt
      updatedAt
    }
  }
`;

export const GET_QUESTION_BANK = gql`
  query GetQuestionBank($id: String!) {
    questionBank(id: $id) {
      id
      name
      description
      category
      questionCount
      createdAt
      updatedAt
      questions {
        id
        content
        options
        correctAnswer
        explanation
        difficulty
        createdAt
      }
    }
  }
`;

export const CREATE_QUESTION_BANK = gql`
  mutation CreateQuestionBank($input: CreateQuestionBankInput!) {
    createQuestionBank(input: $input) {
      id
      name
      category
    }
  }
`;

export const UPDATE_QUESTION_BANK = gql`
  mutation UpdateQuestionBank($id: String!, $input: UpdateQuestionBankInput!) {
    updateQuestionBank(id: $id, input: $input) {
      id
      name
      description
      category
    }
  }
`;

export const DELETE_QUESTION_BANK = gql`
  mutation DeleteQuestionBank($id: String!) {
    deleteQuestionBank(id: $id) {
      id
    }
  }
`;

export const CREATE_BANK_QUESTION = gql`
  mutation CreateBankQuestion($bankId: String!, $input: CreateBankQuestionInput!) {
    createBankQuestion(bankId: $bankId, input: $input) {
      id
      content
      options
      correctAnswer
      explanation
      difficulty
      createdAt
    }
  }
`;

export const DELETE_BANK_QUESTION = gql`
  mutation DeleteBankQuestion($id: String!) {
    deleteBankQuestion(id: $id) {
      id
    }
  }
`;

export const UPDATE_BANK_QUESTION = gql`
  mutation UpdateBankQuestion($id: String!, $input: UpdateBankQuestionInput!) {
    updateBankQuestion(id: $id, input: $input) {
      id
      content
      options
      correctAnswer
      explanation
      difficulty
      createdAt
    }
  }
`;

export const BULK_IMPORT_QUESTIONS = gql`
  mutation BulkImportQuestions($bankId: String!, $questions: [BulkImportQuestionInput!]!) {
    bulkImportQuestions(bankId: $bankId, questions: $questions) {
      count
    }
  }
`;

export const PARSE_RAW_QUESTIONS = gql`
  mutation ParseRawQuestions($rawText: String!) {
    parseRawQuestions(rawText: $rawText)
  }
`;
