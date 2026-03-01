/**
 * Script de Setup do Banco de Dados
 *
 * Este script é responsável por:
 * 1. Resetar o banco de dados (dropar todas as tabelas)
 * 2. Criar todas as tabelas (via synchronize do TypeORM)
 * 3. Inserir dados iniciais (seeds)
 *
 * Uso:
 *   bun run src/scripts/setup-db.ts
 *
 * No Docker:
 *   docker compose exec unasp-api-backend bun run src/scripts/setup-db.ts
 */

import { DataSource, Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

// ============================================
// Entidades inline para evitar problemas de importação
// ============================================

@Entity('users')
class UserOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'boolean', default: false })
  admin: boolean;

  @Column({ type: 'uuid', name: 'community_id' })
  communityId: string;

  @Column({ type: 'varchar', length: 255 })
  position: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

@Entity('communities')
class CommunityOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  type: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', default: {} })
  seo: {
    title: string;
    description: string;
    ogImage?: string;
  };

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

@Entity('pages')
class PageOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  slug: string;

  @Column({ type: 'jsonb', default: {} })
  content: any;

  @Column('uuid')
  communityId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

@Entity('menus')
class MenuOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  communityId: string;

  @Column({ type: 'jsonb', default: [] })
  items: any[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

interface SeedOptions {
  reset: boolean;
  seedUsers: boolean;
  seedCommunities: boolean;
  seedPages: boolean;
}

async function parseArgs(): Promise<SeedOptions> {
  const args = process.argv.slice(2);
  const options: SeedOptions = {
    reset: true,
    seedUsers: true,
    seedCommunities: true,
    seedPages: true,
  };

  for (const arg of args) {
    switch (arg) {
      case '--no-reset':
        options.reset = false;
        break;
      case '--no-users':
        options.seedUsers = false;
        break;
      case '--no-communities':
        options.seedCommunities = false;
        break;
      case '--no-pages':
        options.seedPages = false;
        break;
      case '--help':
        console.log(`
Usage: bun run src/scripts/setup-db.ts [options]

Options:
  --no-reset          Não resetar o banco de dados
  --no-users          Não inserir usuários
  --no-communities    Não inserir comunidades
  --no-pages          Não inserir páginas
  --help              Mostrar esta ajuda
                `);
        process.exit(0);
    }
  }

  return options;
}

async function setupDatabase() {
  console.log('\n========================================');
  console.log('🔧 SETUP DO BANCO DE DADOS - UNASP API');
  console.log('========================================\n');

  const options = await parseArgs();

  // Criar DataSource diretamente (sem NestJS)
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'unasp',
    entities: [UserOrmEntity, CommunityOrmEntity, PageOrmEntity, MenuOrmEntity],
    synchronize: false,
    logging: true,
  });

  try {
    // Conectar ao banco de dados
    await dataSource.initialize();
    console.log('✅ Conectado ao banco de dados!\n');

    // ========================================
    // 1. RESET DO BANCO DE DADOS
    // ========================================
    if (options.reset) {
      console.log('🔄 [1/4] Resetando banco de dados...\n');

      // Dropar todas as tabelas
      await dataSource.dropDatabase();
      console.log('✅ Todas as tabelas foram removidas\n');

      // Sincronizar entidades (criar tabelas)
      await dataSource.synchronize(true);
      console.log('✅ Todas as tabelas foram criadas\n');
    } else {
      console.log('⏭️  [1/4] Reset do banco de dados desabilitado\n');
    }

    // ========================================
    // 2. SEED DE COMUNIDADES (primeiro, pois usuários dependem)
    // ========================================
    if (options.seedCommunities) {
      console.log('🏛️  [2/4] Inserindo comunidades...\n');

      const communityRepository = dataSource.getRepository(CommunityOrmEntity);

      const communities: CommunityOrmEntity[] = [
        {
          id: faker.string.uuid(),
          name: 'Igreja UNASP Central',
          slug: 'igreja-central',
          type: 'church',
          logoUrl: 'https://example.com/logo-central.png',
          isActive: true,
          seo: {
            title: 'Igreja UNASP Central',
            description: 'Vem para a Central!',
            ogImage: 'https://example.com/og-central.png',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        } as CommunityOrmEntity,
        {
          id: faker.string.uuid(),
          name: 'Comusou',
          slug: 'comusou',
          type: 'ministry',
          logoUrl: 'https://example.com/logo-comusou.png',
          isActive: true,
          seo: {
            title: 'Comusou - Ministério Jovem',
            description: 'Comunidade Jovem',
            ogImage: 'https://example.com/og-comusou.png',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        } as CommunityOrmEntity,
        {
          id: faker.string.uuid(),
          name: 'Ministério de Música',
          slug: 'ministerio-musica',
          type: 'ministry',
          logoUrl: 'https://example.com/logo-musica.png',
          isActive: true,
          seo: {
            title: 'Ministério de Música',
            description: 'Louvor e adoração',
            ogImage: 'https://example.com/og-musica.png',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        } as CommunityOrmEntity,
      ];

      await communityRepository.save(communities);

      console.log(`✅ Criadas ${communities.length} comunidades:`);
      communities.forEach((community, index) => {
        console.log(
          `   ${index + 1}. ${community.name} (${community.slug}) - Tipo: ${community.type}`,
        );
      });
      console.log('');
    } else {
      console.log('⏭️  [2/4] Seed de comunidades desabilitado\n');
    }

    // ========================================
    // 3. SEED DE USUÁRIOS (depois de comunidades)
    // ========================================
    if (options.seedUsers) {
      console.log('👤 [3/4] Inserindo usuários...\n');

      const userRepository = dataSource.getRepository(UserOrmEntity);
      const communityRepository = dataSource.getRepository(CommunityOrmEntity);

      // Buscar comunidade padrão para associar os usuários
      const defaultCommunity = await communityRepository.findOne({
        where: { slug: 'igreja-central' },
      });

      if (!defaultCommunity) {
        throw new Error('Comunidade padrão não encontrada!');
      }

      const users: UserOrmEntity[] = [];

      // Criar usuário admin
      const adminUser = new UserOrmEntity();
      adminUser.name = 'Administrador';
      adminUser.email = 'admin@unasp.com';
      adminUser.password = await bcrypt.hash('admin123', 10);
      adminUser.admin = true;
      adminUser.communityId = defaultCommunity.id;
      adminUser.position = 'Administrador do Sistema';
      adminUser.image = faker.image.avatar();
      users.push(adminUser);

      // Criar usuários fake
      for (let i = 0; i < 9; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();

        const user = new UserOrmEntity();
        user.name = `${firstName} ${lastName}`;
        user.email = faker.internet
          .email({ firstName, lastName })
          .toLowerCase();
        user.password = await bcrypt.hash('password123', 10);
        user.admin = false;
        user.communityId = defaultCommunity.id;
        user.position = faker.person.jobTitle();
        user.image = faker.image.avatar();

        users.push(user);
      }

      await userRepository.save(users);

      console.log(`✅ Criados ${users.length} usuários:`);
      users.forEach((user, index) => {
        console.log(
          `   ${index + 1}. ${user.name} (${user.email}) - Admin: ${user.admin ? 'Sim' : 'Não'}`,
        );
      });
      console.log('');
    } else {
      console.log('⏭️  [3/4] Seed de usuários desabilitado\n');
    }

    // ========================================
    // 4. SEED DE PÁGINAS
    // ========================================
    if (options.seedPages) {
      console.log('📄 [4/4] Inserindo páginas...\n');

      const communityRepository = dataSource.getRepository(CommunityOrmEntity);
      const pageRepository = dataSource.getRepository(PageOrmEntity);

      // Buscar a comunidade "igreja-central"
      const centralCommunity = await communityRepository.findOne({
        where: { slug: 'igreja-central' },
      });

      if (centralCommunity) {
        const pages: PageOrmEntity[] = [
          {
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
                    backgroundImage: 'https://example.com/hero.jpg',
                  },
                },
                {
                  type: 'section',
                  props: { title: 'Nossos Cultos' },
                  children: [
                    {
                      type: 'card',
                      props: {
                        title: 'Domingo',
                        text: '19h - Culto da Família',
                      },
                    },
                    {
                      type: 'card',
                      props: { title: 'Quarta', text: '20h - Culto de Oração' },
                    },
                  ],
                },
              ],
            },
            communityId: centralCommunity.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as PageOrmEntity,
          {
            title: 'Sobre Nós',
            slug: 'sobre',
            content: {
              type: 'page',
              children: [
                {
                  type: 'text',
                  props: {
                    content:
                      'Somos uma comunidade acolhedora que acredita no poder transformador do amor de Deus. Junte-se a nós!',
                  },
                },
                {
                  type: 'section',
                  props: { title: 'Nossa História' },
                  children: [
                    {
                      type: 'text',
                      props: {
                        content:
                          'Fundada em 2020, a Igreja UNASP Central tem sido um farol de esperança para a comunidade.',
                      },
                    },
                  ],
                },
              ],
            },
            communityId: centralCommunity.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as PageOrmEntity,
          {
            title: 'Contato',
            slug: 'contato',
            content: {
              type: 'page',
              children: [
                {
                  type: 'text',
                  props: {
                    content: 'Entre em contato conosco!',
                  },
                },
                {
                  type: 'contact',
                  props: {
                    email: 'contato@unasp.com',
                    phone: '(11) 99999-9999',
                    address: 'Rua Exemplo, 123 - São Paulo, SP',
                  },
                },
              ],
            },
            communityId: centralCommunity.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as PageOrmEntity,
        ];

        await pageRepository.save(pages);

        console.log(
          `✅ Criadas ${pages.length} páginas para a comunidade "${centralCommunity.name}":`,
        );
        pages.forEach((page, index) => {
          console.log(`   ${index + 1}. ${page.title} (${page.slug})`);
        });
      } else {
        console.log(
          '⚠️  Comunidade "igreja-central" não encontrada. Execute o seed de comunidades primeiro.\n',
        );
      }
      console.log('');
    } else {
      console.log('⏭️  [4/4] Seed de páginas desabilitado\n');
    }

    // ========================================
    // CONCLUSÃO
    // ========================================
    console.log('========================================');
    console.log('🎉 SETUP DO BANCO DE DADOS CONCLUÍDO!');
    console.log('========================================\n');
    console.log('📝 Credenciais de acesso padrão:');
    console.log('   Admin: admin@unasp.com / admin123');
    console.log('   Usuário: [usuáriosfake]@example.com / password123');
    console.log('');
  } catch (error) {
    console.error('\n❌ Erro durante o setup do banco de dados:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

// Executar o setup
setupDatabase().catch((error) => {
  console.error('❌ Falha no setup:', error);
  process.exit(1);
});
