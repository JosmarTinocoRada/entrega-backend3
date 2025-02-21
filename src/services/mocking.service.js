
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import { usersService, petsService } from '../services/index.js';
import { CustomError, errorDictionary } from '../utils/errorHandler.js';

class MockingService {
    static generatePets(count = 100) {
        let pets = [];
        for (let i = 0; i < count; i++) {
            const pet = {
                name: faker.animal.type(),
                specie: faker.animal.type(),
                birthDate: faker.date.past(),
                adopted: false,
            };
            pets.push(pet);
        }
        return pets;
    }
    static async generateUsers(count = 50) {

        let users = [];
        const password = await bcrypt.hash('coder123', 10);

        for (let i = 0; i < count; i++) {
            const user = {
                first_name: faker.person.firstName(),
                last_name: faker.person.lastName(),
                email: faker.internet.email(),
                password: password,
                role: faker.helpers.arrayElement(['user', 'admin']),
                pets: []
            };
            users.push(user);
        }


        return users;
    }
    static async generateAndInsertUsers(count) {
        const users = [];
        const password = await bcrypt.hash('coder123', 10);

        try {
            for (let i = 0; i < count; i++) {
                const user = {
                    first_name: faker.person.firstName(),
                    last_name: faker.person.lastName(),
                    email: faker.internet.email(),
                    password,
                    role: faker.helpers.arrayElement(['user', 'admin']),
                    pets: []
                };
                if (!['user', 'admin'].includes(user.role)) {
                    throw new CustomError(
                        errorDictionary.INVALID_ROLE.code,
                        errorDictionary.INVALID_ROLE.message,
                        'Invalid user role provided'
                    );
                }

                users.push(user);
            }

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
        const pets = [];
        try {
            for (let i = 0; i < count; i++) {
                const pet = {
                    name: faker.animal.type(),
                    specie: faker.helpers.arrayElement(['dog', 'cat', 'bird', 'rabbit']),
                    birthDate: faker.date.past(5).toISOString().split('T')[0],
                    adopted: false,
                    owner: null
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
