"use client";

import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
    BookOpen, Code2, Lightbulb, Puzzle, Rocket,
    Layers, Zap, Target, Cpu, Globe, Shield,
    CheckCircle2, ArrowRight, Copy, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────── Icon Picker ─────────────── */
const ICON_MAP: Record<string, React.ComponentType<any>> = {
    default: Lightbulb, book: BookOpen, code: Code2,
    puzzle: Puzzle, rocket: Rocket, layers: Layers,
    zap: Zap, target: Target, cpu: Cpu, globe: Globe,
    shield: Shield, check: CheckCircle2,
};

function pickIcon(text: string) {
    const lower = text.toLowerCase();
    if (lower.includes("code") || lower.includes("lập trình") || lower.includes("cú pháp")) return Code2;
    if (lower.includes("bảo mật") || lower.includes("security")) return Shield;
    if (lower.includes("web") || lower.includes("internet")) return Globe;
    if (lower.includes("hiệu suất") || lower.includes("tốc độ") || lower.includes("nhanh")) return Zap;
    if (lower.includes("mục tiêu") || lower.includes("ứng dụng")) return Target;
    if (lower.includes("module") || lower.includes("thư viện") || lower.includes("framework")) return Layers;
    if (lower.includes("khởi đầu") || lower.includes("bắt đầu")) return Rocket;
    if (lower.includes("cpu") || lower.includes("xử lý") || lower.includes("máy")) return Cpu;
    return Lightbulb;
}

/* ─────────────── Copy Button for Code ─────────────── */
function CopyButton({ code }: { code: string }) {
    const [copied, setCopied] = React.useState(false);
    return (
        <button
            onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-slate-700/80 px-2 py-1 text-xs text-slate-300 hover:bg-slate-600 transition-colors backdrop-blur-sm"
            aria-label="Copy code"
        >
            {copied ? <><Check className="h-3 w-3" /> Đã copy</> : <><Copy className="h-3 w-3" /> Copy</>}
        </button>
    );
}

/* ─────────────── Feature Cards Parser ─────────────── */
/**
 * Detect bullet lists that describe "features" and convert them to grid cards.
 * Pattern: lines like "- **Feature Name**: Description"
 */
function tryParseFeatureCards(children: React.ReactNode): { title: string; desc: string }[] | null {
    const items: { title: string; desc: string }[] = [];
    React.Children.forEach(children, (child) => {
        if (!React.isValidElement(child)) return;
        // Each <li> child
        const liChildren = (child as any).props?.children;
        if (!liChildren) return;
        const text = extractText(liChildren);
        // Match "**Title**: Description" or "**Title** - Description"
        const match = text.match(/^\*?\*?(.+?)\*?\*?\s*[:–\-]\s*(.+)$/);
        if (match) {
            items.push({ title: match[1].replace(/\*\*/g, "").trim(), desc: match[2].trim() });
        }
    });
    return items.length >= 3 ? items : null;
}

function extractText(node: React.ReactNode): string {
    if (typeof node === "string") return node;
    if (Array.isArray(node)) return node.map(extractText).join("");
    if (React.isValidElement(node)) return extractText((node as any).props?.children);
    return "";
}

/* ─────────────── Content Cleaner ─────────────── */
function cleanContent(body: string, title: string): string {
    let cleaned = body;

    // Remove leading H1 that duplicates the lesson title
    const titleNormalized = title.toLowerCase().replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF\s]/g, "").trim();
    const h1Match = cleaned.match(/^#\s+(.+?)(?:\n|$)/);
    if (h1Match) {
        const h1Normalized = h1Match[1].toLowerCase().replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF\s]/g, "").trim();
        // If h1 is very similar to the lesson title, remove it
        if (h1Normalized.includes(titleNormalized) || titleNormalized.includes(h1Normalized) || levenshteinSimilar(h1Normalized, titleNormalized)) {
            cleaned = cleaned.replace(/^#\s+.+?\n+/, "");
        }
    }

    // Remove common redundant intro headings
    cleaned = cleaned.replace(/^##\s*(Lời Mở Đầu|Giới Thiệu|Mở Đầu)\s*\n+/i, "");

    return cleaned.trim();
}

function levenshteinSimilar(a: string, b: string): boolean {
    if (a.length === 0 || b.length === 0) return false;
    const shorter = a.length < b.length ? a : b;
    const longer = a.length < b.length ? b : a;
    return longer.includes(shorter) || shorter.length / longer.length > 0.6;
}

/* ─────────────── Main Component ─────────────── */
interface LessonMarkdownRendererProps {
    body: string;
    title: string;
    className?: string;
}

export default function LessonMarkdownRenderer({ body, title, className }: LessonMarkdownRendererProps) {
    const cleaned = useMemo(() => cleanContent(body, title), [body, title]);

    return (
        <article className={cn("lesson-content", className)}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    /* ── Headings ── */
                    h1: ({ children }) => (
                        <h1 className="text-2xl font-bold text-slate-900 mt-8 mb-4 pb-2 border-b-2 border-blue-100 first:mt-0">
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3 flex items-center gap-2">
                            <span className="inline-block w-1 h-6 rounded-full bg-blue-500" />
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-2">{children}</h3>
                    ),

                    /* ── Paragraphs ── */
                    p: ({ children }) => (
                        <p className="text-sm leading-relaxed text-slate-600 mb-4">{children}</p>
                    ),

                    /* ── Strong and Em ── */
                    strong: ({ children }) => (
                        <strong className="font-semibold text-slate-800">{children}</strong>
                    ),
                    em: ({ children }) => (
                        <em className="text-blue-600 not-italic font-medium">{children}</em>
                    ),

                    /* ── Lists — try card layout for features ── */
                    ul: ({ children }) => {
                        const featureCards = tryParseFeatureCards(children);
                        if (featureCards) {
                            return (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-6">
                                    {featureCards.map((card, i) => {
                                        const Icon = pickIcon(card.title);
                                        return (
                                            <div
                                                key={i}
                                                className="group rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 hover:border-blue-200 hover:shadow-md transition-all duration-200"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-500 group-hover:bg-blue-100 transition-colors">
                                                        <Icon className="h-4.5 w-4.5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="text-sm font-bold text-blue-700 mb-0.5">{card.title}</h4>
                                                        <p className="text-xs leading-relaxed text-slate-500">{card.desc}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        }
                        return <ul className="space-y-2 my-4 pl-0 list-none">{children}</ul>;
                    },
                    ol: ({ children }) => (
                        <ol className="space-y-2 my-4 pl-5 list-decimal marker:text-blue-500 marker:font-semibold">{children}</ol>
                    ),
                    li: ({ children }) => (
                        <li className="flex items-start gap-2 text-sm text-slate-600">
                            <ArrowRight className="h-4 w-4 shrink-0 text-blue-400 mt-0.5" />
                            <span>{children}</span>
                        </li>
                    ),

                    /* ── Blockquote ── */
                    blockquote: ({ children }) => (
                        <blockquote className="my-4 rounded-r-lg border-l-4 border-blue-400 bg-blue-50/50 px-4 py-3 text-sm text-slate-700 italic">
                            {children}
                        </blockquote>
                    ),

                    /* ── Tables ── */
                    table: ({ children }) => (
                        <div className="my-6 overflow-hidden rounded-lg border border-slate-200 shadow-sm">
                            <table className="w-full text-sm">{children}</table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-blue-600 text-white">{children}</thead>
                    ),
                    th: ({ children }) => (
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">{children}</th>
                    ),
                    tbody: ({ children }) => (
                        <tbody className="divide-y divide-slate-100">{children}</tbody>
                    ),
                    tr: ({ children }) => (
                        <tr className="even:bg-slate-50 hover:bg-blue-50/30 transition-colors">{children}</tr>
                    ),
                    td: ({ children }) => (
                        <td className="px-4 py-2.5 text-slate-600">{children}</td>
                    ),

                    /* ── Code blocks ── */
                    code: ({ className: codeClassName, children, ...props }) => {
                        const match = /language-(\w+)/.exec(codeClassName || "");
                        const codeString = String(children).replace(/\n$/, "");

                        if (match) {
                            return (
                                <div className="relative my-6 rounded-xl overflow-hidden shadow-lg border border-slate-700/30">
                                    {/* Language badge */}
                                    <div className="flex items-center justify-between bg-slate-800 px-4 py-2 border-b border-slate-700">
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1.5">
                                                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                                                <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                                                <span className="h-3 w-3 rounded-full bg-green-500/80" />
                                            </div>
                                            <span className="text-xs font-mono text-slate-400 ml-2">{match[1]}</span>
                                        </div>
                                        <CopyButton code={codeString} />
                                    </div>
                                    {/* @ts-ignore */}
                                    <SyntaxHighlighter
                                        language={match[1]}
                                        style={oneDark}
                                        customStyle={{
                                            margin: 0,
                                            padding: "1rem 1.25rem",
                                            fontSize: "0.8rem",
                                            lineHeight: "1.6",
                                            background: "#1e293b",
                                            borderRadius: 0,
                                        }}
                                        showLineNumbers
                                        lineNumberStyle={{ color: "#475569", fontSize: "0.7rem", paddingRight: "1rem" }}
                                    >
                                        {codeString}
                                    </SyntaxHighlighter>
                                </div>
                            );
                        }

                        // Inline code
                        return (
                            <code className="rounded-md bg-blue-50 px-1.5 py-0.5 text-xs font-mono text-blue-700 border border-blue-100" {...props}>
                                {children}
                            </code>
                        );
                    },

                    /* ── Horizontal rule ── */
                    hr: () => (
                        <hr className="my-8 border-t-2 border-dashed border-slate-200" />
                    ),

                    /* ── Links ── */
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 font-medium hover:text-blue-800 underline decoration-blue-200 underline-offset-2 hover:decoration-blue-400 transition-colors"
                        >
                            {children}
                        </a>
                    ),

                    /* ── Images ── */
                    img: ({ src, alt }) => (
                        <span className="block my-6">
                            <img src={src} alt={alt || ""} className="rounded-lg shadow-md border border-slate-200 max-w-full" />
                            {alt && <span className="block mt-2 text-center text-xs text-slate-400 italic">{alt}</span>}
                        </span>
                    ),
                }}
            >
                {cleaned}
            </ReactMarkdown>
        </article>
    );
}
