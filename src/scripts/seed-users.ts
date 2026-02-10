import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';
import { UserOrmEntity } from '../modules/user/infrastructure/persistence/entities/user.orm-entity';
import * as bcrypt from 'bcrypt';

async function seed() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);
    const userRepository = dataSource.getRepository(UserOrmEntity);

    console.log('🌱 Seeding database with 10 users...\n');

    // Clear existing users
    await dataSource.query('TRUNCATE TABLE users CASCADE');
    console.log('🧹 Cleared existing users\n');

    // Generate a fixed community ID for all users
    const communityId = faker.string.uuid();
    console.log(`📍 Community ID: ${communityId}\n`);

    const users: UserOrmEntity[] = [];

    for (let i = 0; i < 10; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const plainPassword = 'password123';

        const user = new UserOrmEntity();
        user.id = faker.string.uuid();
        user.name = `${firstName} ${lastName}`;
        user.email = faker.internet.email({ firstName, lastName }).toLowerCase();
        user.password = await bcrypt.hash(plainPassword, 10);
        user.admin = i === 0; // First user is admin
        user.communityId = communityId;
        user.position = faker.person.jobTitle();
        user.image = faker.image.avatar();

        users.push(user);
    }

    await userRepository.save(users);

    console.log('✅ Successfully created 10 users:\n');
    users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Position: ${user.position}`);
        console.log(`   Admin: ${user.admin ? 'Yes' : 'No'}`);
        console.log(`   ID: ${user.id}\n`);
    });

    await app.close();
    console.log('🎉 Seeding completed!');
}

seed().catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
});
