import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
    { name: 'Lập trình', slug: 'lap-trinh', order: 0 },
    { name: 'Thiết kế', slug: 'thiet-ke', order: 1 },
    { name: 'Kinh doanh', slug: 'kinh-doanh', order: 2 },
    { name: 'Marketing', slug: 'marketing', order: 3 },
    { name: 'Ngoại ngữ', slug: 'ngoai-ngu', order: 4 },
    { name: 'Phát triển cá nhân', slug: 'phat-trien-ca-nhan', order: 5 },
    { name: 'Khác', slug: 'khac', order: 6 },
];

async function main() {
    console.log('Seeding default categories...');
    for (const cat of DEFAULT_CATEGORIES) {
        await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: cat,
        });
    }
    const count = await prisma.category.count();
    console.log(`Done! ${count} categories in database.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
