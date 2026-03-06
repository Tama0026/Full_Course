import { gql } from "@apollo/client";

// ════════════════════════════════════════════════
// ADMIN STATS
// ════════════════════════════════════════════════

export const GET_ADMIN_STATS = gql`
  query GetAdminStats {
    adminStats {
      totalUsers
      totalCourses
      totalEnrollments
      totalBadges
      totalStudents
      totalInstructors
    }
  }
`;

// ════════════════════════════════════════════════
// ADMIN BADGES
// ════════════════════════════════════════════════

export const GET_ADMIN_ALL_BADGES = gql`
  query GetAdminAllBadges {
    adminAllBadges {
      id
      name
      description
      icon
      criteria
      criteriaType
      threshold
      courseId
      courseName
      creatorId
      awardedCount
      createdAt
    }
  }
`;

export const ADMIN_CREATE_BADGE = gql`
  mutation AdminCreateBadge($input: AdminCreateBadgeInput!) {
    adminCreateBadge(input: $input) {
      id
      name
      description
      icon
      criteria
      criteriaType
      threshold
      courseId
      courseName
      creatorId
      awardedCount
      createdAt
    }
  }
`;

export const ADMIN_UPDATE_BADGE = gql`
  mutation AdminUpdateBadge($badgeId: String!, $input: UpdateBadgeInput!) {
    adminUpdateBadge(badgeId: $badgeId, input: $input) {
      id
      name
      description
      icon
      criteria
      criteriaType
      threshold
      courseId
      courseName
      creatorId
      awardedCount
      createdAt
    }
  }
`;

export const ADMIN_DELETE_BADGE = gql`
  mutation AdminDeleteBadge($badgeId: String!) {
    adminDeleteBadge(badgeId: $badgeId)
  }
`;

// ════════════════════════════════════════════════
// ADMIN COURSES
// ════════════════════════════════════════════════

export const GET_ADMIN_ALL_COURSES = gql`
  query GetAdminAllCourses($take: Int, $skip: Int, $search: String) {
    adminAllCourses(take: $take, skip: $skip, search: $search) {
      items {
        id
        title
        description
        price
        thumbnail
        category
        published
        isActive
        instructorId
        instructor {
          id
          name
          email
        }
        enrollmentCount
        sectionCount
        createdAt
        updatedAt
      }
      totalCount
      hasMore
    }
  }
`;

// ════════════════════════════════════════════════
// CATEGORIES (reuse existing mutations)
// ════════════════════════════════════════════════

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      slug
      order
    }
  }
`;

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id
      name
      slug
      order
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: String!) {
    deleteCategory(id: $id) {
      id
    }
  }
`;
