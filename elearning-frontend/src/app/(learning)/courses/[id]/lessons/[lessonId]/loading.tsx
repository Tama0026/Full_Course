import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex h-screen flex-col items-center justify-center gap-4 text-slate-500 bg-slate-50">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            <p className="text-sm font-medium">Đang tải nội dung bài học...</p>
        </div>
    );
}
