import { useState, useCallback } from "react";
import { UploadCloud, CheckCircle2, Loader2, X, Film, FileText } from "lucide-react";
import { useApolloClient } from "@apollo/client/react";
import { GET_UPLOAD_SIGNATURE } from "@/lib/graphql/course";

interface CloudinaryUploaderProps {
    onUploadSuccess: (url: string, format?: string, duration?: number) => void;
    resourceType: "video" | "raw" | "auto"; // 'raw' for PDFs/Documents, 'video' for Videos, 'auto' for auto-detect
    currentUrl?: string;
    onClear?: () => void;
}

export default function CloudinaryUploader({ onUploadSuccess, resourceType, currentUrl, onClear }: CloudinaryUploaderProps) {
    const apolloClient = useApolloClient();
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        setUploading(true);
        setProgress(0);

        try {
            // 1. Get Signature from our backend
            const { data } = await apolloClient.query<any>({
                query: GET_UPLOAD_SIGNATURE,
                fetchPolicy: "network-only",
            });

            if (!data?.uploadSignature) throw new Error("Không thể lấy chữ ký tải lên");
            const sigData = data.uploadSignature;

            // 2. Prepare FormData for Cloudinary
            const formData = new FormData();
            formData.append("file", file);
            formData.append("api_key", sigData.apiKey);
            formData.append("timestamp", sigData.timestamp);
            formData.append("signature", sigData.signature);
            formData.append("folder", sigData.folder);
            formData.append("type", sigData.type); // "upload" — public delivery

            // 3. Upload via XHR for progress tracking
            const xhr = new XMLHttpRequest();
            // Use "auto" so Cloudinary correctly detects MP4 as "video" and PDF as "raw"
            // If we use "raw" for MP4, it forces download instead of streaming.
            xhr.open("POST", `https://api.cloudinary.com/v1_1/${sigData.cloudName}/auto/upload`);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    setProgress(percentComplete);
                }
            };

            xhr.onload = () => {
                const response = JSON.parse(xhr.responseText);
                if (xhr.status >= 200 && xhr.status < 300) {
                    setUploading(false);
                    setProgress(100);
                    onUploadSuccess(response.secure_url, response.format, response.duration ? Math.round(response.duration) : undefined);
                } else {
                    setUploading(false);
                    setError(response.error?.message || "Lỗi khi tải lên Cloudinary");
                }
            };

            xhr.onerror = () => {
                setUploading(false);
                setError("Có lỗi mạng xảy ra khi tải lên.");
            };

            xhr.send(formData);
        } catch (err: any) {
            setUploading(false);
            setError(err.message || "Upload thất bại");
        }
    };

    if (currentUrl && !uploading) {
        return (
            <div className="flex flex-col gap-3 rounded-lg border border-primary-200 bg-primary-50 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {resourceType === "video" ? (
                            <Film className="h-5 w-5 text-primary-600" />
                        ) : (
                            <FileText className="h-5 w-5 text-primary-600" />
                        )}
                        <span className="text-sm font-medium text-primary-800 truncate max-w-[200px] sm:max-w-xs">
                            {currentUrl.split("/").pop()}
                        </span>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </div>
                    {onClear && (
                        <button onClick={onClear} type="button" className="text-slate-400 hover:text-red-500 transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>
                {resourceType === "video" && (
                    <div className="mt-2 w-full overflow-hidden rounded-md bg-black">
                        <video
                            src={currentUrl}
                            controls
                            className="w-full aspect-video"
                            title="Video Preview"
                        />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden">
            <label
                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 transition-colors ${uploading
                    ? "border-primary-200 bg-primary-50/50"
                    : "border-slate-300 bg-slate-50 hover:border-primary-400 hover:bg-slate-100"
                    }`}
            >
                {uploading ? (
                    <div className="flex flex-col items-center">
                        <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary-600" />
                        <div className="text-sm font-medium text-primary-700 font-mono text-center">
                            Đang tải lên: {progress}%
                            <div className="mt-2 w-48 h-2 bg-primary-100 rounded-full overflow-hidden">
                                <div className="h-full bg-primary-600 transition-all duration-300" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <UploadCloud className="mb-3 h-10 w-10 text-slate-400" />
                        <span className="mb-1 text-sm font-semibold text-slate-700">Nhấn để chọn file</span>
                        <span className="text-xs text-slate-500">
                            {resourceType === "video" ? "Video (MP4, WEBM) tối đa 100MB" : "Tài liệu (PDF) tối đa 10MB"}
                        </span>
                    </>
                )}
                <input
                    type="file"
                    className="hidden"
                    accept={resourceType === "video" ? "video/*" : ".pdf"}
                    onChange={handleFileChange}
                    disabled={uploading}
                />
            </label>

            {error && (
                <p className="mt-2 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
}
