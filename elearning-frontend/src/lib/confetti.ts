import confetti from 'canvas-confetti';

/**
 * Triggers a short burst of confetti from both bottom corners.
 * Recommended for smaller achievements like passing a single quiz.
 */
export const triggerConfetti = () => {
    const end = Date.now() + 1500;

    // The student theme 'Professional Blue' color palette (+ a little accent)
    const colors = ['#2563eb', '#3b82f6', '#60a5fa', '#fcd34d'];

    (function frame() {
        confetti({
            particleCount: 4,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.8 },
            colors: colors,
            zIndex: 1000 // Ensure it's above modals and everything
        });
        confetti({
            particleCount: 4,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.8 },
            colors: colors,
            zIndex: 1000
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    })();
};

/**
 * Creates a "rain" of confetti lasting for a specified duration (default 3 seconds).
 * Best for major milestones like completing an entire course.
 */
export const triggerRainConfetti = (durationMs = 3000) => {
    const end = Date.now() + durationMs;
    const colors = ['#2563eb', '#4f46e5', '#8b5cf6', '#eab308', '#f43f5e'];

    (function frame() {
        confetti({
            particleCount: 5,
            startVelocity: 30,
            spread: 360,
            ticks: 60,
            zIndex: 1000,
            origin: {
                x: Math.random(),
                // Start slightly above the top of the viewport
                y: Math.random() - 0.2
            },
            colors: colors
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    })();
};
