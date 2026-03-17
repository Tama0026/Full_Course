"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_MY_NOTIFICATIONS, GET_UNREAD_COUNT, MARK_NOTIFICATION_READ, MARK_ALL_NOTIFICATIONS_READ } from "@/lib/graphql/notification";
import { Bell, CheckCheck, Award, BookOpen, Star, Users, Settings, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<string, typeof Bell> = {
    ENROLLMENT: Users,
    BADGE: Award,
    CERTIFICATE: Award,
    REVIEW: Star,
    COURSE_UPDATE: BookOpen,
    SYSTEM: Settings,
};

const TYPE_COLORS: Record<string, string> = {
    ENROLLMENT: "text-blue-500 bg-blue-50",
    BADGE: "text-amber-500 bg-amber-50",
    CERTIFICATE: "text-green-500 bg-green-50",
    REVIEW: "text-purple-500 bg-purple-50",
    COURSE_UPDATE: "text-primary-500 bg-primary-50",
    SYSTEM: "text-slate-500 bg-slate-50",
};

/**
 * NotificationBell — Bell icon with unread badge and dropdown panel.
 * Placed in the dashboard top bar.
 */
export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Queries
    const { data: countData, refetch: refetchCount } = useQuery<{
        unreadNotificationCount: { count: number };
    }>(GET_UNREAD_COUNT, {
        pollInterval: 30000, // Poll every 30s
    });

    const { data: notifsData, refetch: refetchNotifs } = useQuery<{
        myNotifications: any[];
    }>(GET_MY_NOTIFICATIONS, {
        variables: { take: 10 },
        skip: !isOpen,
    });

    // Mutations
    const [markRead] = useMutation(MARK_NOTIFICATION_READ);
    const [markAllRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ);

    const unreadCount = countData?.unreadNotificationCount?.count || 0;
    const notifications = notifsData?.myNotifications || [];

    // Close on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // When opening, refetch
    useEffect(() => {
        if (isOpen) {
            refetchNotifs();
        }
    }, [isOpen, refetchNotifs]);

    const handleClick = async (notif: any) => {
        if (!notif.isRead) {
            await markRead({ variables: { notificationId: notif.id } });
            refetchCount();
            refetchNotifs();
        }
        if (notif.link) {
            router.push(notif.link);
            setIsOpen(false);
        }
    };

    const handleMarkAllRead = async () => {
        await markAllRead();
        refetchCount();
        refetchNotifs();
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "Vừa xong";
        if (mins < 60) return `${mins} phút trước`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} giờ trước`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days} ngày trước`;
        return `${Math.floor(days / 30)} tháng trước`;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-[16px] rounded-full bg-rose-500 text-white text-[9px] font-bold px-0.5 animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-11 w-72 rounded-lg border border-slate-200 bg-white shadow-lg z-50 overflow-hidden">
                    {/* Arrow pointer */}
                    <div className="absolute -top-2 right-3 w-4 h-4 rotate-45 border-l border-t border-slate-200 bg-white" />

                    {/* Header */}
                    <div className="relative flex items-center justify-between px-3 py-2.5 border-b border-slate-100 bg-white">
                        <span className="text-xs font-semibold text-slate-700">Thông báo</span>
                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="flex items-center gap-1 text-[10px] text-primary-600 hover:text-primary-700 font-medium transition-colors px-1.5 py-0.5 rounded hover:bg-primary-50"
                                >
                                    <CheckCheck size={12} />
                                    Đọc tất cả
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-0.5 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-50"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-[320px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="py-8 text-center">
                                <Bell className="mx-auto h-6 w-6 text-slate-300" />
                                <p className="mt-1.5 text-xs text-slate-400">Chưa có thông báo</p>
                            </div>
                        ) : (
                            notifications.map((notif: any) => {
                                const Icon = TYPE_ICONS[notif.type] || Bell;
                                const colorClass = TYPE_COLORS[notif.type] || "text-slate-500 bg-slate-50";
                                return (
                                    <button
                                        key={notif.id}
                                        onClick={() => handleClick(notif)}
                                        className={cn(
                                            "w-full flex items-start gap-2.5 px-3 py-2.5 text-left transition-colors border-b border-slate-50 last:border-b-0",
                                            notif.isRead
                                                ? "hover:bg-slate-50"
                                                : "bg-primary-50/30 hover:bg-primary-50/50"
                                        )}
                                    >
                                        <div className={cn("shrink-0 w-7 h-7 rounded-md flex items-center justify-center", colorClass)}>
                                            <Icon size={14} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <p className={cn("text-xs font-medium truncate", notif.isRead ? "text-slate-600" : "text-slate-900")}>
                                                    {notif.title}
                                                </p>
                                                {!notif.isRead && (
                                                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary-500" />
                                                )}
                                            </div>
                                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{notif.message}</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">{formatTime(notif.createdAt)}</p>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
