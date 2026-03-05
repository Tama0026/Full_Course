import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ExamState {
    answersByAttempt: Record<string, Record<string, string>>;
    currentIndex: number;
    isSubmitting: boolean;
    isFullscreen: boolean;
    warnCount: number;

    // Actions
    setAnswer: (attemptId: string, questionId: string, answer: string) => void;
    setCurrentIndex: (index: number) => void;
    setIsSubmitting: (submitting: boolean) => void;
    setIsFullscreen: (val: boolean) => void;
    incrementWarnCount: () => void;
    setWarnCount: (count: number) => void;
    initAttempt: (attemptId: string) => void;
    clearAttempt: (attemptId: string) => void;
}

export const useExamStore = create<ExamState>()(
    persist(
        (set, get) => ({
            answersByAttempt: {},
            currentIndex: 0,
            isSubmitting: false,
            isFullscreen: false,
            warnCount: 0,

            setAnswer: (attemptId, questionId, answer) => {
                set((state) => {
                    const attemptAnswers = state.answersByAttempt[attemptId] || {};
                    return {
                        answersByAttempt: {
                            ...state.answersByAttempt,
                            [attemptId]: {
                                ...attemptAnswers,
                                [questionId]: answer,
                            },
                        },
                    };
                });
            },

            setCurrentIndex: (index) => set({ currentIndex: index }),
            setIsSubmitting: (submitting) => set({ isSubmitting: submitting }),
            setIsFullscreen: (val) => set({ isFullscreen: val }),
            incrementWarnCount: () => set((state) => ({ warnCount: state.warnCount + 1 })),
            setWarnCount: (count) => set({ warnCount: count }),

            initAttempt: (attemptId) => {
                set((state) => {
                    if (!state.answersByAttempt[attemptId]) {
                        return {
                            answersByAttempt: { ...state.answersByAttempt, [attemptId]: {} },
                            currentIndex: 0,
                            warnCount: 0,
                        };
                    }
                    return { currentIndex: 0, warnCount: 0 }; // Reset index and warn on re-enter
                });
            },

            clearAttempt: (attemptId) => {
                set((state) => {
                    const newAnswers = { ...state.answersByAttempt };
                    delete newAnswers[attemptId];
                    return { answersByAttempt: newAnswers, currentIndex: 0, warnCount: 0 };
                });
            },
        }),
        {
            name: "exam-storage",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ answersByAttempt: state.answersByAttempt }), // Only persist answers
        }
    )
);
