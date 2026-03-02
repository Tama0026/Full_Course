import { getServerClient } from "@/lib/apollo-server";
import { GET_COURSES } from "@/lib/graphql/course";
import HomePageClient from "./HomePageClient";

/* ────────────────────────────────────────────────────────
   Homepage — Server Component (data fetching)
   ──────────────────────────────────────────────────────── */

export default async function HomePage() {
    const client = await getServerClient();
    let featuredCourses: any[] = [];

    try {
        const { data } = await client.query<any>({
            query: GET_COURSES,
            fetchPolicy: "no-cache",
        });

        featuredCourses = (data.courses || [])
            .map((c: any) => ({
                id: c.id,
                title: c.title,
                description: c.description,
                price: c.price,
                instructor: c.instructor?.email,
                lessonCount:
                    c.sections?.reduce(
                        (acc: number, s: any) => acc + (s.lessons?.length || 0),
                        0
                    ) || 0,
            }))
            .slice(0, 4);
    } catch (error) {
        console.error("Failed to fetch featured courses:", error);
    }

    return <HomePageClient featuredCourses={featuredCourses} />;
}
