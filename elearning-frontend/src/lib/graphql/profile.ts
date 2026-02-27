import { gql } from "@apollo/client";

export const GET_PROFILE = gql`
  query GetProfile {
    me {
      id email name headline bio avatar aiRank role createdAt updatedAt
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id email name headline bio avatar role
    }
  }
`;

export const GET_MY_CERTIFICATES = gql`
  query GetMyCertificatesProfile {
    myCertificates {
      id certificateCode userId courseId userName courseName courseNameAtIssue issueDate createdAt
    }
  }
`;

export const ASSESS_SKILL = gql`
  mutation AssessSkill {
    assessSkill
  }
`;
