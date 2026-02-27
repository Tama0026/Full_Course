"use client";

import { cn } from "@/lib/utils";

interface VideoPlayerProps {
    videoUrl?: string;
    title?: string;
    className?: string;
}

/**
 * VideoPlayer — responsive video player component.
 * Wraps an iframe/video in a 16:9 aspect-ratio container.
 *
 * Currently uses a placeholder; replace the inner content
 * with your preferred player (e.g., Video.js, Plyr, or
 * an embedded iframe for YouTube/Vimeo).
 */
export function VideoPlayer({ videoUrl, title, className }: VideoPlayerProps) {
    return (
        <div className={cn("w-full", className)}>
            {/* 16:9 aspect ratio container */}
            <div className="relative w-full overflow-hidden rounded-lg bg-slate-900 aspect-video">
                {videoUrl ? (
                    <video
                        src={videoUrl}
                        controls
                        className="absolute inset-0 h-full w-full object-contain"
                        title={title}
                    >
                        <track kind="captions" />
                        Trình duyệt không hỗ trợ video.
                    </video>
                ) : (
                    /* Placeholder when no video is available */
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-400">
                        <svg
                            className="h-16 w-16"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <p className="text-sm font-medium">Chọn bài học để bắt đầu</p>
                    </div>
                )}
            </div>

            {/* Video title */}
            {title && (
                <div className="mt-4 px-1">
                    <h1 className="text-xl font-bold text-slate-900 lg:text-2xl">
                        {title}
                    </h1>
                </div>
            )}
        </div>
    );
}
