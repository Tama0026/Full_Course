/**
 * Cleanup Duplicate Badges Script
 * ─────────────────────────────────
 * This script finds duplicate badges (grouped by `criteria`),
 * reassigns UserBadge records to the oldest badge, then deletes duplicates.
 *
 * Run: npx ts-node prisma/cleanup-duplicate-badges.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Scanning for duplicate badges...\n');

    // 1. Get all badges grouped by criteria
    const allBadges = await (prisma as any).badge.findMany({
        orderBy: { createdAt: 'asc' },
    });

    // Group by criteria
    const grouped: Record<string, any[]> = {};
    for (const badge of allBadges) {
        const key = badge.criteria;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(badge);
    }

    let totalDuplicates = 0;
    let totalReassigned = 0;

    for (const [criteria, badges] of Object.entries(grouped)) {
        if (badges.length <= 1) continue; // No duplicates

        const keep = badges[0]; // Keep the oldest one
        const duplicates = badges.slice(1);

        console.log(`📋 Criteria: "${criteria}"`);
        console.log(`   ✅ Keeping:   "${keep.name}" (id: ${keep.id}, created: ${keep.createdAt})`);

        for (const dup of duplicates) {
            // Find all UserBadge records pointing to the duplicate
            const userBadgesForDup = await (prisma as any).userBadge.findMany({
                where: { badgeId: dup.id },
            });

            for (const ub of userBadgesForDup) {
                // Check if user already has a UserBadge for the kept badge
                const alreadyHasKept = await (prisma as any).userBadge.findFirst({
                    where: { userId: ub.userId, badgeId: keep.id },
                });

                if (alreadyHasKept) {
                    // User already has the kept badge → just delete the duplicate UserBadge
                    await (prisma as any).userBadge.delete({ where: { id: ub.id } });
                    console.log(`   🗑️  Removed duplicate UserBadge for user ${ub.userId}`);
                } else {
                    // Reassign this UserBadge to the kept badge
                    await (prisma as any).userBadge.update({
                        where: { id: ub.id },
                        data: { badgeId: keep.id },
                    });
                    console.log(`   🔄 Reassigned UserBadge for user ${ub.userId} → "${keep.name}"`);
                    totalReassigned++;
                }
            }

            // Delete the duplicate badge
            await (prisma as any).badge.delete({ where: { id: dup.id } });
            console.log(`   🗑️  Deleted:   "${dup.name}" (id: ${dup.id})`);
            totalDuplicates++;
        }
        console.log('');
    }

    // 2. Also clean up any duplicate UserBadge records (same userId + badgeId)
    console.log('🔍 Scanning for duplicate UserBadge records...');
    const allUserBadges = await (prisma as any).userBadge.findMany({
        orderBy: { awardedAt: 'asc' },
    });

    const ubSeen = new Set<string>();
    let ubDuplicates = 0;
    for (const ub of allUserBadges) {
        const key = `${ub.userId}__${ub.badgeId}`;
        if (ubSeen.has(key)) {
            await (prisma as any).userBadge.delete({ where: { id: ub.id } });
            ubDuplicates++;
        } else {
            ubSeen.add(key);
        }
    }
    if (ubDuplicates > 0) {
        console.log(`   🗑️  Removed ${ubDuplicates} duplicate UserBadge record(s)\n`);
    } else {
        console.log('   ✅ No duplicate UserBadge records found.\n');
    }

    // 3. Summary
    console.log('════════════════════════════════════════');
    console.log('  CLEANUP SUMMARY');
    console.log('════════════════════════════════════════');
    console.log(`  Duplicate badges removed:   ${totalDuplicates}`);
    console.log(`  UserBadge records reassigned: ${totalReassigned}`);
    console.log(`  Duplicate UserBadges removed: ${ubDuplicates}`);

    const remaining = await (prisma as any).badge.count();
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
