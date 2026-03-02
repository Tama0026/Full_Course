import { getServerClient } from "@/lib/apollo-server";
import { GET_COURSES } from "@/lib/graphql/course";
import { GET_CATEGORIES } from "@/lib/graphql/category";
import { CoursesClient } from "./CoursesClient";

export default async function CoursesPage() {
    const client = await getServerClient();

    let courses = [];
    let categories: { id: string; name: string; slug: string }[] = [];
    try {
        const [coursesRes, categoriesRes] = await Promise.all([
            client.query<any>({
                query: GET_COURSES,
                fetchPolicy: "no-cache",
            }),
            client.query<any>({
                query: GET_CATEGORIES,
                fetchPolicy: "no-cache",
            }),
        ]);
        courses = coursesRes.data.courses || [];
        categories = categoriesRes.data.categories || [];
    } catch (error) {
        console.error("Failed to fetch courses/categories:", error);
    }

    return <CoursesClient initialCourses={courses} categories={categories} />;
}
