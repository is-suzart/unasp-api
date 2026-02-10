import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { CreatePageUseCase } from '../modules/community/application/use-cases/create-page.use-case';
import { CommunityRepository } from '../modules/community/domain/community.repository';

async function seed() {
    const app = await NestFactory.createApplicationContext(AppModule);

    const createPageUseCase = app.get(CreatePageUseCase);
    const communityRepository = app.get<CommunityRepository>('CommunityRepository');

    console.log('🌱 Seeding database with Pages...\n');

    try {
        // 1. Find "Igreja Central"
        const community = await communityRepository.findBySlug('igreja-central');
        if (!community) {
            throw new Error('Community "igreja-central" not found. Run "yarn seed:communities" first.');
        }

        console.log(`Found community: ${community.name} (${community.id})`);

        // 2. Create Home Page
        console.log('Creating "Home Page"...');
        const homeInfo = {
            title: 'Início',
            slug: 'home',
            content: {
                type: 'page',
                children: [
                    {
                        type: 'hero',
                        props: {
                            title: 'Bem-vindo à Central',
                            subtitle: 'Uma igreja viva para um Deus vivo',
                            backgroundImage: 'https://example.com/hero.jpg'
                        }
                    },
                    {
                        type: 'section',
                        props: { title: 'Nossos Cultos' },
                        children: [
                            { type: 'card', props: { title: 'Domingo', text: '19h - Culto da Família' } },
                            { type: 'card', props: { title: 'Quarta', text: '20h - Culto de Oração' } }
                        ]
                    }
                ]
            }
        };

        try {
            const home = await createPageUseCase.execute(community.id, homeInfo);
            console.log(`✅ Created: ${home.title} (${home.id})\n`);
        } catch (e) {
            if (e.message.includes('already exists')) console.log('⚠️ Home page already exists');
            else throw e;
        }

        // 3. Create About Page
        console.log('Creating "About Page"...');
        const aboutInfo = {
            title: 'Sobre Nós',
            slug: 'sobre',
            content: {
                type: 'page',
                children: [
                    {
                        type: 'text',
                        props: {
                            content: 'Somos uma comunidade acolhedora...'
                        }
                    }
                ]
            }
        };

        try {
            const about = await createPageUseCase.execute(community.id, aboutInfo);
            console.log(`✅ Created: ${about.title} (${about.id})\n`);
        } catch (e) {
            if (e.message.includes('already exists')) console.log('⚠️ About page already exists');
            else throw e;
        }

    } catch (error) {
        console.error('❌ Error seeding pages:', error);
    } finally {
        await app.close();
    }
}

seed();
