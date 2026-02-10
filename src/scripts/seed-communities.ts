import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { CreateCommunityUseCase } from '../modules/community/application/use-cases/create-community.use-case';
import { CommunityRepository } from '../modules/community/domain/community.repository';

async function seed() {
    const app = await NestFactory.createApplicationContext(AppModule);

    const createCommunityUseCase = app.get(CreateCommunityUseCase);
    const communityRepository = app.get<CommunityRepository>('CommunityRepository'); // Correctly typed

    console.log('🌱 Seeding database with Communities...\n');

    try {
        // 1. Igreja Central
        console.log('Creating "Igreja Central"...');
        const central = await createCommunityUseCase.execute({
            name: 'Igreja UNASP Central',
            slug: 'igreja-central',
            type: 'church',
            logoUrl: 'https://example.com/logo-central.png',
            seo: {
                title: 'Igreja UNASP Central',
                description: 'Vem para a Central!',
            },
        });
        console.log(`✅ Created: ${central.name} (${central.id})\n`);

        // 2. Comusou
        console.log('Creating "Comusou"...');
        const comusou = await createCommunityUseCase.execute({
            name: 'Comusou',
            slug: 'comusou',
            type: 'ministry',
            logoUrl: 'https://example.com/logo-comusou.png',
            seo: {
                title: 'Comusou',
                description: 'Comunidade Jovem',
            },
        });
        console.log(`✅ Created: ${comusou.name} (${comusou.id})\n`);

    } catch (error) {
        if (error.message.includes('already exists')) {
            console.log('⚠️ Communities already exist, skipping creation.');
        } else {
            console.error('❌ Error seeding communities:', error);
        }
    } finally {
        await app.close();
    }
}

seed();
