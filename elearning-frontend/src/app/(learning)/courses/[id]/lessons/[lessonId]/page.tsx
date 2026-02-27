import { getServerClient } from "@/lib/apollo-server";
import { GET_LESSON, GET_COURSE_PROGRESS } from "@/lib/graphql/learning";
import { GET_COURSE_DETAIL } from "@/lib/graphql/course";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { LessonClientView } from "./LessonClientView";

export default async function LessonPage(props: { params: Promise<{ id: string; lessonId: string }> }) {
    const params = await props.params;
    const client = await getServerClient();

    let courseData: any = null;
    let lessonData: any = null;
    let progressData: any = null;

    try {
        const [courseRes, lessonRes, progressRes] = await Promise.all([
            client.query<any>({ query: GET_COURSE_DETAIL, variables: { id: params.id } })
                .catch((e: any) => { console.error("[LessonPage] GET_COURSE_DETAIL failed:", e.message); return null; }),
            client.query<any>({ query: GET_LESSON, variables: { lessonId: params.lessonId } })
                .catch((e: any) => { console.error("[LessonPage] GET_LESSON failed:", e.message); return null; }),
            client.query<any>({ query: GET_COURSE_PROGRESS, variables: { courseId: params.id } })
                .catch((e: any) => { console.error("[LessonPage] GET_COURSE_PROGRESS failed:", e.message); return null; }),
        ]);

        if (!courseRes?.data?.course || !lessonRes?.data?.lesson) {
            console.error("[LessonPage] Missing data - course:", !!courseRes?.data?.course, "lesson:", !!lessonRes?.data?.lesson);
            return notFound();
        }

        courseData = courseRes.data.course;
        lessonData = lessonRes.data.lesson;
        progressData = progressRes?.data?.courseProgress;

        console.log("[LessonPage] Lesson data received:", {
            id: lessonData.id,
            title: lessonData.title,
            type: lessonData.type,
            videoUrl: lessonData.videoUrl ? lessonData.videoUrl.substring(0, 80) + "..." : null,
            hasBody: !!lessonData.body,
        });
    } catch (error) {
        console.error("[LessonPage] Failed to fetch lesson data:", error);
        return notFound();
    }

    // Get current userId from cookie for Discussion component
    let currentUserId: string | undefined;
    try {
        const cookieStore = await cookies();
        const userInfo = cookieStore.get("user_info")?.value;
        if (userInfo) {
            currentUserId = JSON.parse(userInfo).id;
        }
    } catch { }

    const completedItems = progressData?.completedItems || [];
    const progressPercentage = progressData?.progressPercentage || 0;

    return (
        <LessonClientView
            key={lessonData.id}
            course={courseData}
            lesson={lessonData}
            completedItems={completedItems}
            progressPercentage={progressPercentage}
            currentUserId={currentUserId}
        />
    );
}
