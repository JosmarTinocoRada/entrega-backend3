import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import { usersService, petsService } from '../services/index.js';
import { CustomError, errorDictionary } from '../utils/errorHandler.js';

class MockingService {
    static async generateUsers(count = 50) {
        let users = [];
        const password = await bcrypt.hash('coder123', 10);

        // Obtener correos ya existentes en la BD para evitar duplicados
        const existingEmails = new Set(await usersService.getAll().then(users => users.map(u => u.email)));

        for (let i = 0; i < count; i++) {
            let email;
            do {
                email = faker.internet.email();
            } while (existingEmails.has(email)); // Evitar duplicados

            existingEmails.add(email);

            const user = {
                first_name: faker.person.firstName(),
                last_name: faker.person.lastName(),
                email,
                password,
                role: faker.helpers.arrayElement(['user', 'admin']),
                pets: []
            };
            users.push(user);
        }
        return users;
    }

    static async generateAndInsertUsers(count) {
        try {
            const users = await this.generateUsers(count);
            await usersService.createMany(users);
            return users;
        } catch (error) {
            throw new CustomError(
                errorDictionary.MOCKING_ERROR.code,
                errorDictionary.MOCKING_ERROR.message,
                error.message,
            );
        }
    }

    static async generateAndInsertPets(count) {
        try {
            const users = await usersService.getAll();
            const userIds = users.map(user => user._id); // Obtener IDs de usuarios existentes

            let pets = [];
            for (let i = 0; i < count; i++) {
                const pet = {
                    name: faker.animal.type(),
                    specie: faker.helpers.arrayElement(['dog', 'cat', 'bird', 'rabbit']),
                    birthDate: faker.date.past(5).toISOString().split('T')[0],
                    adopted: false,
                    owner: faker.helpers.arrayElement([...userIds, null]) // Algunas mascotas tendrán dueño
                };
                pets.push(pet);
            }

            await petsService.createMany(pets);
            return pets;
        } catch (error) {
            throw new CustomError(
                errorDictionary.MOCKING_ERROR.code,
                errorDictionary.MOCKING_ERROR.message,
                error.message
            );
        }
    }
}

export default MockingService;
