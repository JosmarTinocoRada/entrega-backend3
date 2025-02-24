import { Router } from 'express';
import mongoose from 'mongoose';
import { adoptionsService, petsService, usersService } from '../services/index.js';

const router = Router();

// Obtener todas las adopciones
router.get('/', async (req, res) => {
    try {
        const result = await adoptionsService.getAll();
        res.status(200).json({ status: "success", payload: result });
    } catch (error) {
        console.error("Error fetching adoptions:", error);
        res.status(500).json({ status: "error", message: "Error fetching adoptions" });
    }
});

// Obtener una adopción por ID
router.get('/:aid', async (req, res) => {
    try {
        const { aid } = req.params;

        if (!mongoose.Types.ObjectId.isValid(aid)) {
            return res.status(400).json({ status: "error", message: "Invalid adoption ID" });
        }

        const adoption = await adoptionsService.getBy({ _id: aid });

        if (!adoption) {
            return res.status(404).json({ status: "error", message: "Adoption not found" });
        }

        res.status(200).json({ status: "success", payload: adoption });
    } catch (error) {
        console.error("Error fetching adoption:", error);
        res.status(500).json({ status: "error", message: "Error fetching adoption" });
    }
});

// Crear una adopción cuando usuario y mascota existen
router.post('/:uid/:pid', async (req, res) => {
    try {
        const { uid, pid } = req.params;

        // Verificar que los IDs sean válidos
        if (!mongoose.Types.ObjectId.isValid(uid) || !mongoose.Types.ObjectId.isValid(pid)) {
            return res.status(400).json({ status: "error", message: "Invalid user or pet ID" });
        }

        // Obtener el usuario
        const user = await usersService.getUserById(uid);
        if (!user) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }

        // Obtener la mascota
        const pet = await petsService.getBy({ _id: pid });
        if (!pet) {
            return res.status(404).json({ status: "error", message: "Pet not found" });
        }

        // Verificar si la mascota ya está adoptada
        if (pet.adopted) {
            return res.status(400).json({ status: "error", message: "Pet is already adopted" });
        }

        // Asegurar que user.pets sea un array antes de agregar la mascota
        if (!Array.isArray(user.pets)) {
            user.pets = [];
        }

        // Asignar la mascota al usuario
        user.pets.push(pet._id);
        await usersService.update(user._id, { pets: user.pets });

        // Marcar la mascota como adoptada
        await petsService.update(pet._id, { adopted: true, owner: user._id });

        // Registrar la adopción
        const adoption = await adoptionsService.create({ owner: user._id, pet: pet._id });

        res.status(201).json({ status: "success", message: "Pet adopted", payload: adoption });
    } catch (error) {
        console.error("Error creating adoption:", error);
        res.status(500).json({ status: "error", message: "Error creating adoption" });
    }
});

export default router;
