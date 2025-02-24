import { Router } from 'express';
import PetDTO from '../dto/Pet.dto.js';
import { petsService } from '../services/index.js';
import { CustomError, errorDictionary, handleError } from '../utils/errorHandler.js';
import { __dirname } from '../utils/index.js';  // 🔥 Corrección aquí
import uploader from '../utils/uploader.js';

const router = Router();

// Obtener todas las mascotas
router.get('/', async (req, res) => {
    try {
        const pets = await petsService.getAll();
        res.send({ status: "success", payload: pets });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error fetching pets' });
    }
});

// Crear una nueva mascota
router.post('/', async (req, res) => {
    try {
        const { name, specie, birthDate } = req.body;
        if (!name || !specie || !birthDate) {
            throw new CustomError(errorDictionary.INCOMPLETE_VALUES.code, errorDictionary.INCOMPLETE_VALUES.message, 'Name, specie and birthDate are required');
        }
        const pet = PetDTO.getPetInputFrom({ name, specie, birthDate });
        const result = await petsService.create(pet);
        res.status(201).json({ status: 'success', payload: result });
    } catch (error) {
        handleError(error, res);
    }
});

// Crear una mascota con imagen
router.post('/withimage', uploader.single('image'), async (req, res) => {
    try {
        const file = req.file;
        const { name, specie, birthDate } = req.body;

        if (!name || !specie || !birthDate) {
            return res.status(400).send({ status: "error", error: "Incomplete values" });
        }

        const pet = PetDTO.getPetInputFrom({
            name,
            specie,
            birthDate,
            image: `${__dirname}/../public/img/${file.filename}`
        });

        const result = await petsService.create(pet);
        res.send({ status: "success", payload: result });

    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error creating pet with image' });
    }
});

// Actualizar una mascota
router.put('/:pid', async (req, res) => {
    try {
        const petUpdateBody = req.body;
        const petId = req.params.pid;
        await petsService.update(petId, petUpdateBody);
        res.send({ status: "success", message: "Pet updated" });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error updating pet' });
    }
});

// Eliminar una mascota
router.delete('/:pid', async (req, res) => {
    try {
        const petId = req.params.pid;
        await petsService.delete(petId);
        res.send({ status: "success", message: "Pet deleted" });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error deleting pet' });
    }
});

export default router;
