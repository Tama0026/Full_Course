"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const CRITERIA_MAP = {
    'COMPLETE_1_LESSON': { criteriaType: 'LESSONS_COMPLETED', threshold: 1 },
    'COMPLETE_3_LESSONS': { criteriaType: 'LESSONS_COMPLETED', threshold: 3 },
    'COMPLETE_5_LESSONS': { criteriaType: 'LESSONS_COMPLETED', threshold: 5 },
    'COMPLETE_10_LESSONS': { criteriaType: 'LESSONS_COMPLETED', threshold: 10 },
    'COMPLETE_25_LESSONS': { criteriaType: 'LESSONS_COMPLETED', threshold: 25 },
    'COMPLETE_1_COURSE': { criteriaType: 'COURSES_COMPLETED', threshold: 1 },
    'COMPLETE_3_COURSES': { criteriaType: 'COURSES_COMPLETED', threshold: 3 },
    'REACH_100_POINTS': { criteriaType: 'POINTS_EARNED', threshold: 100 },
    'REACH_500_POINTS': { criteriaType: 'POINTS_EARNED', threshold: 500 },
    'REACH_1000_POINTS': { criteriaType: 'POINTS_EARNED', threshold: 1000 },
};
async function main() {
    const badges = await prisma.badge.findMany();
    console.log(`Found ${badges.length} badges to process...\n`);
    let updated = 0;
    let skipped = 0;
    for (const badge of badges) {
        const mapping = CRITERIA_MAP[badge.criteria];
        if (mapping) {
            await prisma.badge.update({
                where: { id: badge.id },
                data: {
                    criteriaType: mapping.criteriaType,
                    threshold: mapping.threshold,
                },
            });
            console.log(`✅ ${badge.name}: ${badge.criteria} → ${mapping.criteriaType} (${mapping.threshold})`);
            updated++;
        }
        else {
            const lessonMatch = badge.criteria.match(/COMPLETE_(\d+)_LESSON/);
            const courseMatch = badge.criteria.match(/COMPLETE_(\d+)_COURSE/);
            const pointsMatch = badge.criteria.match(/REACH_(\d+)_POINTS/);
            if (lessonMatch) {
                await prisma.badge.update({
                    where: { id: badge.id },
                    data: { criteriaType: 'LESSONS_COMPLETED', threshold: parseInt(lessonMatch[1]) },
                });
                console.log(`✅ ${badge.name}: auto-parsed → LESSONS_COMPLETED (${lessonMatch[1]})`);
                updated++;
            }
            else if (courseMatch) {
                await prisma.badge.update({
                    where: { id: badge.id },
                    data: { criteriaType: 'COURSES_COMPLETED', threshold: parseInt(courseMatch[1]) },
                });
                console.log(`✅ ${badge.name}: auto-parsed → COURSES_COMPLETED (${courseMatch[1]})`);
                updated++;
            }
            else if (pointsMatch) {
                await prisma.badge.update({
                    where: { id: badge.id },
                    data: { criteriaType: 'POINTS_EARNED', threshold: parseInt(pointsMatch[1]) },
                });
                console.log(`✅ ${badge.name}: auto-parsed → POINTS_EARNED (${pointsMatch[1]})`);
                updated++;
            }
            else {
                console.log(`⚠️  ${badge.name}: unknown criteria "${badge.criteria}" — skipped (defaults to LESSONS_COMPLETED/1)`);
                skipped++;
            }
        }
    }
    console.log(`\n═══════════════════════════════════`);
    console.log(`Done! Updated: ${updated}, Skipped: ${skipped}`);
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=migrate-badge-criteria.js.map