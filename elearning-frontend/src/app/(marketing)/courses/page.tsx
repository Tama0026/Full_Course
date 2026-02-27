import { getServerClient } from "@/lib/apollo-server";
import { GET_COURSES } from "@/lib/graphql/course";
import { CoursesClient } from "./CoursesClient";

export default async function CoursesPage() {
    const client = await getServerClient();

    let courses = [];
    try {
        const { data } = await client.query<any>({
            query: GET_COURSES,
            fetchPolicy: "no-cache",
        });
        courses = data.courses || [];
    } catch (error) {
        console.error("Failed to fetch courses:", error);
    }

    return <CoursesClient initialCourses={courses} />;
}
