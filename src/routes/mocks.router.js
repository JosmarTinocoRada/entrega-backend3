import { Router } from 'express';
import mockingController from '../controllers/mocks.controller.js';

const router = Router();

router.get('/mockingpets', mockingController.getMockingPets)
router.get('/mockingusers', mockingController.getMockingUsers)
router.post('/generateData', mockingController.generateData)


export default router