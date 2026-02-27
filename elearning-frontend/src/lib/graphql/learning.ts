import { gql } from "@apollo/client";

export const GET_LESSON = gql`
  query GetLesson($lessonId: String!) {
    lesson(lessonId: $lessonId) {
      id title order type videoUrl body sectionId
      createdAt updatedAt
    }
  }
`;

export const GET_COURSE_PROGRESS = gql`
  query GetCourseProgress($courseId: String!) {
    courseProgress(courseId: $courseId) {
      totalLessons
      completedLessons
      progressPercentage
      completedItems {
        id lessonId completedAt
      }
      enrollment { id courseId userId enrolledAt }
    }
  }
`;

export const MARK_LESSON_COMPLETE = gql`
  mutation MarkLessonComplete($lessonId: String!) {
    markLessonComplete(lessonId: $lessonId) {
      id lessonId completedAt enrollmentId
    }
  }
`;

export const GET_MY_ENROLLMENTS = gql`
  query GetMyEnrollments {
    myEnrollments {
      id
      enrolledAt
      isFinished
      course {
        id
        title
        instructor { id email }
        sections {
          id
          title
          order
          lessons {
            id
            title
            order
          }
        }
      }
      progresses {
        id
        lessonId
        completedAt
      }
    }
  }
`;

export const IS_ENROLLED = gql`
  query IsEnrolled($courseId: String!) {
    isEnrolled(courseId: $courseId)
  }
`;

export const CLAIM_CERTIFICATE = gql`
  mutation ClaimCertificate($courseId: String!) {
    claimCertificate(courseId: $courseId) {
      id
      certificateCode
      userId
      courseId
      courseNameAtIssue
      certificateUrl
      issueDate
      createdAt
    }
  }
`;

export const GET_MY_CERTIFICATES = gql`
  query GetMyCertificates {
    myCertificates {
      id
      certificateCode
      userId
      courseId
      courseNameAtIssue
      certificateUrl
      issueDate
      createdAt
    }
  }
`;
