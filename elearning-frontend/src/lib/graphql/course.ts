import { gql } from "@apollo/client";

export const GET_COURSES = gql`
  query GetCourses {
    courses {
      id
      title
      description
      price
      published
      instructorId
      instructor { id email }
      sections {
        id title order
        lessons { id title order videoUrl }
      }
      createdAt
    }
  }
`;

export const GET_COURSE_DETAIL = gql`
  query GetCourse($id: String!) {
    course(id: $id) {
      id
      title
      description
      price
      published
      instructorId
      instructor { id email }
      sections {
        id title order
        lessons { id title order type videoUrl body duration isPreview isLocked }
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_MY_COURSES = gql`
  query GetMyCourses {
    myCourses {
      id
      title
      description
      price
      published
      isActive
      instructorId
      sections {
        id title order
        lessons { id title order type videoUrl body duration isPreview isLocked }
      }
      createdAt
    }
  }
`;

export const CREATE_COURSE = gql`
  mutation CreateCourse($input: CreateCourseInput!) {
    createCourse(input: $input) {
      id title description price published isActive
    }
  }
`;

export const UPDATE_COURSE = gql`
  mutation UpdateCourse($id: String!, $input: UpdateCourseInput!) {
    updateCourse(id: $id, input: $input) {
      id title description price published isActive
    }
  }
`;

export const UPDATE_CURRICULUM = gql`
  mutation UpdateCurriculum($id: String!, $input: UpdateCurriculumInput!) {
    updateCurriculum(id: $id, input: $input) {
      id
      sections {
        id title order
        lessons {
          id title order type videoUrl body duration isPreview
        }
      }
    }
  }
`;

export const CREATE_SECTION = gql`
  mutation CreateSection($input: CreateSectionInput!) {
    createSection(input: $input) {
      id title order courseId
    }
  }
`;

export const CREATE_LESSON = gql`
  mutation CreateLesson($input: CreateLessonInput!) {
    createLesson(input: $input) {
      id title order type videoUrl body sectionId
    }
  }
`;

export const TOGGLE_COURSE_STATUS = gql`
  mutation ToggleCourseStatus($id: String!) {
    toggleCourseStatus(id: $id) {
      id isActive
    }
  }
`;

export const GET_INSTRUCTOR_STATS = gql`
  query GetInstructorStats {
    instructorStats {
      totalCourses
      totalStudents
      totalRevenue
      avgCompletionRate
      courseBreakdown {
        courseId
        title
        studentCount
        completionRate
        avgQuizScore
      }
    }
  }
`;

export const SUGGEST_COURSES = gql`
  query SuggestCourses($query: String!) {
    suggestCourses(query: $query)
  }
`;

export const GENERATE_LESSON_CONTENT = gql`
  mutation GenerateLessonContent($title: String!, $nonce: Float) {
    generateLessonContent(title: $title, nonce: $nonce)
  }
`;

export const GENERATE_LESSON_CONTENT_WITH_QUIZ = gql`
  mutation GenerateLessonContentWithQuiz($title: String!, $lessonId: String!, $quizCount: Int = 5) {
    generateLessonContentWithQuiz(title: $title, lessonId: $lessonId, quizCount: $quizCount)
  }
`;

export const GET_UPLOAD_SIGNATURE = gql`
  query GetUploadSignature {
    uploadSignature {
      timestamp
      signature
      apiKey
      cloudName
      folder
      type
    }
  }
`;
