import { gql } from "@apollo/client";

export const GET_TOP_STUDENTS = gql`
  query GetTopStudents($limit: Int) {
    topStudents(limit: $limit) {
      id
      userId
      totalPoints
      userName
      userAvatar
      rank
    }
  }
`;

export const GET_MY_POINTS = gql`
  query GetMyPoints {
    myPoints
  }
`;

export const GET_MY_BADGES = gql`
  query GetMyBadges {
    myBadges {
      id
      name
      description
      icon
      criteria
      courseId
      courseName
      creatorId
      awardedAt
    }
  }
`;

export const CHAT_INTERVIEW = gql`
  mutation ChatInterview($courseId: String!, $message: String!, $history: [ChatMessageInput!]) {
    chatInterview(courseId: $courseId, message: $message, history: $history) {
      reply
      courseId
      courseName
    }
  }
`;

export const IS_INTERVIEW_UNLOCKED = gql`
  query IsInterviewUnlocked($courseId: String!) {
    isInterviewUnlocked(courseId: $courseId)
  }
`;

// ════════════════════════════════════════════════
// STUDENT ACHIEVEMENTS
// ════════════════════════════════════════════════

export const GET_MY_ACHIEVEMENT_STATS = gql`
  query GetMyAchievementStats {
    myAchievementStats {
      totalPoints
      globalRank
      percentile
      earnedBadges
      totalBadges
      userName
      userAvatar
    }
  }
`;

export const GET_ALL_BADGES_WITH_STATUS = gql`
  query GetAllBadgesWithStatus {
    allBadgesWithStatus {
      id
      name
      description
      icon
      criteria
      courseId
      courseName
      earned
      awardedAt
    }
  }
`;

// ════════════════════════════════════════════════
// INSTRUCTOR BADGE MANAGEMENT
// ════════════════════════════════════════════════

export const GET_MY_CREATED_BADGES = gql`
  query GetMyCreatedBadges {
    myCreatedBadges {
      id
      name
      description
      icon
      criteria
      courseId
      courseName
      creatorId
    }
  }
`;

export const GET_COURSE_BADGES = gql`
  query GetCourseBadges($courseId: String!) {
    courseBadges(courseId: $courseId) {
      id
      name
      description
      icon
      criteria
      courseId
      courseName
      creatorId
    }
  }
`;

export const CREATE_COURSE_BADGE = gql`
  mutation CreateCourseBadge($input: CreateBadgeInput!) {
    createCourseBadge(input: $input) {
      id
      name
      description
      icon
      criteria
      courseId
      courseName
      creatorId
    }
  }
`;

export const UPDATE_COURSE_BADGE = gql`
  mutation UpdateCourseBadge($badgeId: String!, $input: UpdateBadgeInput!) {
    updateCourseBadge(badgeId: $badgeId, input: $input) {
      id
      name
      description
      icon
      criteria
    }
  }
`;

export const DELETE_COURSE_BADGE = gql`
  mutation DeleteCourseBadge($badgeId: String!) {
    deleteCourseBadge(badgeId: $badgeId)
  }
`;
