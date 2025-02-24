import { Router } from 'express';
import userModel from '../dao/models/User.js';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const router = Router();

// Obtener todos los usuarios
router.get('/', async (req, res) => {
    try {
        const users = await userModel.find();
        res.send({ status: "success", payload: users });
    } catch (error) {
        console.error("Error fetching users:", error.message);
        res.status(500).json({ status: 'error', message: 'Error fetching users' });
    }
});

// Obtener un usuario por ID
router.get('/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        
        if (!mongoose.isValidObjectId(uid)) {
            return res.status(400).send({ status: "error", error: "Invalid user ID" });
        }

        const user = await userModel.findById(uid);
        if (!user) return res.status(404).send({ status: "error", error: "User not found" });

        res.send({ status: "success", payload: user });
    } catch (error) {
        console.error("Error fetching user:", error.message);
        res.status(500).json({ status: 'error', message: 'Error fetching user' });
    }
});

// Crear un usuario
router.post('/', async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;
        if (!first_name || !last_name || !email || !password) {
            return res.status(400).send({ status: "error", error: "Incomplete values" });
        }

        // Verificar si el usuario ya existe
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).send({ status: "error", error: "Email already in use" });
        }

        // Encriptar contraseña antes de guardarla
        const hashedPassword = bcrypt.hashSync(password, 10);

        const newUser = new userModel({ first_name, last_name, email, password: hashedPassword });
        await newUser.save();

        res.status(201).send({ status: "success", message: "User created successfully", user: newUser });
    } catch (error) {
        console.error("Error creating user:", error.message);
        res.status(500).json({ status: 'error', message: 'Error creating user' });
    }
});

// Actualizar un usuario
router.put('/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        
        if (!mongoose.isValidObjectId(uid)) {
            return res.status(400).send({ status: "error", error: "Invalid user ID" });
        }

        const updateData = { ...req.body };

        // Si se incluye un password, validamos que no esté vacío y lo encriptamos
        if (updateData.password) {
            if (updateData.password.trim() === "") {
                return res.status(400).send({ status: "error", error: "Password cannot be empty" });
            }
            updateData.password = bcrypt.hashSync(updateData.password, 10);
        }

        const updatedUser = await userModel.findByIdAndUpdate(uid, updateData, { new: true });
        if (!updatedUser) return res.status(404).send({ status: "error", error: "User not found" });

        res.send({ status: "success", message: "User updated", payload: updatedUser });
    } catch (error) {
        console.error("Error updating user:", error.message);
        res.status(500).json({ status: 'error', message: 'Error updating user' });
    }
});

// Eliminar un usuario
router.delete('/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        
        if (!mongoose.isValidObjectId(uid)) {
            return res.status(400).send({ status: "error", error: "Invalid user ID" });
        }

        const deletedUser = await userModel.findByIdAndDelete(uid);
        if (!deletedUser) return res.status(404).send({ status: "error", error: "User not found" });

        res.send({ status: "success", message: "User deleted" });
    } catch (error) {
        console.error("Error deleting user:", error.message);
        res.status(500).json({ status: 'error', message: 'Error deleting user' });
    }
});

export default router;
