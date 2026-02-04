import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Read data from JSON file
    const dataPath = path.join(__dirname, 'seed-data.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const data = JSON.parse(rawData);

    // Clear existing data
    // Delete in order to avoid foreign key constraints
    await prisma.round.deleteMany();
    await prisma.group.deleteMany();
    await prisma.schedule.deleteMany();
    await prisma.member.deleteMany();

    console.log('Cleared existing data.');

    // Import Members
    console.log(`Importing ${data.members.length} members...`);
    for (const m of data.members) {
        const genderReq = m.gender === '남' ? 'male' : 'female';
        await prisma.member.create({
            data: {
                id: m.id, // Use explicit ID to match scores
                name: m.name,
                email: `user${m.id}@example.com`, // Synthetic email
                phone: m.phone,
                handicap: m.handicap, // Float
                gender: genderReq,
                type: 'Regular',
                status: 'active',
                joinDate: new Date(), // Default to now
            }
        });
    }

    // Import Scores (Rounds)
    if (data.scores && data.scores.length > 0) {
        console.log(`Importing ${data.scores.length} scores...`);
        for (const s of data.scores) {
            // Check if member exists (just in case)
            const memberExists = data.members.find((m: any) => m.id === s.member_id);
            if (memberExists) {
                await prisma.round.create({
                    data: {
                        memberId: s.member_id,
                        date: s.date,
                        score: s.score,
                        // courseName: 'Unknown', // Optional
                    }
                });
            }
        }
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
