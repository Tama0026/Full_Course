export default function AssessmentAttemptLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 w-full h-full flex flex-col font-sans">
            {children}
        </div>
    );
}
