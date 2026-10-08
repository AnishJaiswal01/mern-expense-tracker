import express from 'express';
import protect from '../middleware/auth.js';
import {
  getTransactions,
  createTransaction,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  seedTransactions,
} from '../controllers/transactionController.js';

const router = express.Router();

// All transaction routes are protected
router.use(protect);

router.post('/seed', seedTransactions);

router.route('/')
  .get(getTransactions)
  .post(createTransaction);

router.route('/:id')
  .get(getTransaction)
  .put(updateTransaction)
  .delete(deleteTransaction);

export default router;
