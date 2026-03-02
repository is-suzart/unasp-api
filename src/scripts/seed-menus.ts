import { DataSource } from 'typeorm';

interface MenuItem {
  label: string;
  url: string;
  order: number;
  children?: MenuItem[];
}

/**
 * Seed de Menus
 *
 * Este script atualiza os menus das comunidades baseando-se nas páginas existentes.
 * Deve ser executado APÓS seed:communities e seed:pages.
 *
 * Uso:
 *   bun run src/scripts/seed-menus.ts
 *   # ou
 *   npx ts-node src/scripts/seed-menus.ts
 *
 * No Docker:
 *   docker compose exec unasp-api-backend bun run src/scripts/seed-menus.ts
 */

async function seed() {
  // Criar DataSource diretamente (sem NestJS)
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'unasp',
    synchronize: false,
    logging: false,
  });

  console.log('🌱 Seeding database with Menus...\n');

  try {
    // Conectar ao banco de dados
    await dataSource.initialize();
    console.log('✅ Conectado ao banco de dados!\n');

    // Buscar todas as comunidades usando SQL raw
    const communitiesResult = await dataSource.query(
      'SELECT id, name, slug FROM communities',
    );

    if (communitiesResult.length === 0) {
      console.log(
        '⚠️ Nenhuma comunidade encontrada. Execute "yarn seed:communities" primeiro.',
      );
      return;
    }

    console.log(`Encontradas ${communitiesResult.length} comunidades\n`);

    for (const community of communitiesResult) {
      console.log(
        `🔄 Processando comunidade: ${community.name} (${community.slug})`,
      );

      // Buscar páginas desta comunidade usando SQL raw
      const pagesResult = await dataSource.query(
        'SELECT id, title, slug FROM pages WHERE "communityId" = $1',
        [community.id],
      );

      if (pagesResult.length === 0) {
        console.log(
          `  ⚠️ Nenhuma página encontrada para "${community.name}". Pulando menu...`,
        );
        continue;
      }

      console.log(`  📄 Encontradas ${pagesResult.length} páginas`);

      // Gerar itens de menu baseados nas páginas
      const menuItems: MenuItem[] = [];

      // sempre adicionar Home como primeiro item
      menuItems.push({
        label: 'Início',
        url: '/',
        order: 1,
      });

      // Adicionar páginas como itens de menu
      pagesResult.forEach((page: any, index: number) => {
        // Pular página home pois já foi adicionada
        if (page.slug === 'home') return;

        menuItems.push({
          label: page.title,
          url: `/${page.slug}`,
          order: index + 2,
        });
      });

      console.log(`  📋 Itens de menu gerados:`);
      menuItems.forEach((item, idx) => {
        console.log(`     ${idx + 1}. ${item.label} -> ${item.url}`);
      });

      // Verificar se menu já existe
      const existingMenuResult = await dataSource.query(
        'SELECT id FROM menus WHERE "communityId" = $1',
        [community.id],
      );

      if (existingMenuResult.length > 0) {
        // Atualizar menu existente
        await dataSource.query(
          'UPDATE menus SET items = $1 WHERE "communityId" = $2',
          [JSON.stringify(menuItems), community.id],
        );
        console.log(`  ✅ Menu atualizado com sucesso!\n`);
      } else {
        // Criar novo menu
        await dataSource.query(
          'INSERT INTO menus (id, "communityId", items, "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW())',
          [crypto.randomUUID(), community.id, JSON.stringify(menuItems)],
        );
        console.log(`  ✅ Menu criado com sucesso!\n`);
      }
    }

    console.log('========================================');
    console.log('🎉 Seed de Menus concluído com sucesso!');
    console.log('========================================\n');
  } catch (error) {
    console.error('❌ Erro durante seed de menus:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

seed().catch((error) => {
  console.error('❌ Seed de menus falhou:', error);
  process.exit(1);
});
