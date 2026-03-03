"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🔍 Scanning for duplicate badges...\n');
    const allBadges = await prisma.badge.findMany({
        orderBy: { createdAt: 'asc' },
    });
    const grouped = {};
    for (const badge of allBadges) {
        const key = badge.criteria;
        if (!grouped[key])
            grouped[key] = [];
        grouped[key].push(badge);
    }
    let totalDuplicates = 0;
    let totalReassigned = 0;
    for (const [criteria, badges] of Object.entries(grouped)) {
        if (badges.length <= 1)
            continue;
        const keep = badges[0];
        const duplicates = badges.slice(1);
        console.log(`📋 Criteria: "${criteria}"`);
        console.log(`   ✅ Keeping:   "${keep.name}" (id: ${keep.id}, created: ${keep.createdAt})`);
        for (const dup of duplicates) {
            const userBadgesForDup = await prisma.userBadge.findMany({
                where: { badgeId: dup.id },
            });
            for (const ub of userBadgesForDup) {
                const alreadyHasKept = await prisma.userBadge.findFirst({
                    where: { userId: ub.userId, badgeId: keep.id },
                });
                if (alreadyHasKept) {
                    await prisma.userBadge.delete({ where: { id: ub.id } });
                    console.log(`   🗑️  Removed duplicate UserBadge for user ${ub.userId}`);
                }
                else {
                    await prisma.userBadge.update({
                        where: { id: ub.id },
                        data: { badgeId: keep.id },
                    });
                    console.log(`   🔄 Reassigned UserBadge for user ${ub.userId} → "${keep.name}"`);
                    totalReassigned++;
                }
            }
            await prisma.badge.delete({ where: { id: dup.id } });
            console.log(`   🗑️  Deleted:   "${dup.name}" (id: ${dup.id})`);
            totalDuplicates++;
        }
        console.log('');
    }
    console.log('🔍 Scanning for duplicate UserBadge records...');
    const allUserBadges = await prisma.userBadge.findMany({
        orderBy: { awardedAt: 'asc' },
    });
    const ubSeen = new Set();
    let ubDuplicates = 0;
    for (const ub of allUserBadges) {
        const key = `${ub.userId}__${ub.badgeId}`;
        if (ubSeen.has(key)) {
            await prisma.userBadge.delete({ where: { id: ub.id } });
            ubDuplicates++;
        }
        else {
            ubSeen.add(key);
        }
    }
    if (ubDuplicates > 0) {
        console.log(`   🗑️  Removed ${ubDuplicates} duplicate UserBadge record(s)\n`);
    }
    else {
        console.log('   ✅ No duplicate UserBadge records found.\n');
    }
    console.log('════════════════════════════════════════');
    console.log('  CLEANUP SUMMARY');
    console.log('════════════════════════════════════════');
    console.log(`  Duplicate badges removed:   ${totalDuplicates}`);
    console.log(`  UserBadge records reassigned: ${totalReassigned}`);
    console.log(`  Duplicate UserBadges removed: ${ubDuplicates}`);
    const remaining = await prisma.badge.count();
    console.log(`  Total badges remaining:     ${remaining}`);
    console.log('════════════════════════════════════════');
    console.log('✅ Cleanup complete!');
}
main()
    .catch((e) => {
    console.error('❌ Cleanup failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=cleanup-duplicate-badges.js.map