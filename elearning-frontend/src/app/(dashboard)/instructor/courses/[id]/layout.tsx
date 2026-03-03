"use client";

import { useQuery } from "@apollo/client/react";
import { GET_COURSE_DETAIL } from "@/lib/graphql/course";
import { Loader2 } from "lucide-react";
import CourseNav from "@/components/instructor/CourseNav";
import { useParams } from "next/navigation";

export default function InstructorCourseLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();
    const courseId = params.id as string;

    const { data, loading } = useQuery<any>(GET_COURSE_DETAIL, {
        variables: { id: courseId },
        skip: !courseId,
    });

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const courseTitle = data?.course?.title || "Không tìm thấy khóa học";

    return (
        <div className="min-h-screen bg-slate-50 relative flex flex-col">
            <CourseNav courseId={courseId} courseTitle={courseTitle} />
            <div className="flex-1 w-full max-w-6xl mx-auto px-4 lg:px-8 py-8">
                {children}
            </div>
        </div>
    );
}
