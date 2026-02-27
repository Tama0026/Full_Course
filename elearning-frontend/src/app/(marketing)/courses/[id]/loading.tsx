import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            <p className="text-sm font-medium">Đang tải thông tin khóa học...</p>
        </div>
    );
}
