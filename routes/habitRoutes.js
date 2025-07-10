import express from 'express';
import * as habitController from '../controllers/habitController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, habitController.createHabit);
router.get('/', auth, habitController.getHabits);
router.put('/:id', auth, habitController.updateHabit); 
router.patch('/:id/mark', auth, habitController.markHabit);
router.patch('/:id', auth, habitController.editHabit);
router.delete('/:id', auth, habitController.deleteHabit);
router.post('/:habitId/completions', auth, habitController.addCompletion);
router.delete('/:habitId/completions/:date', auth, habitController.removeCompletion);

export default router;
