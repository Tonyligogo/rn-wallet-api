import express from 'express';
import { createTransaction, deleteTransaction, getTransactionsByUserId, getTransactionsSummary, updateTransaction } from '../controllers/transactionsController.js';

const router = express.Router();

router.get("/:userId", getTransactionsByUserId)

router.post("/", createTransaction)

router.put("/:id", updateTransaction);

router.delete("/:id", deleteTransaction)

router.get("/summary/:userId", getTransactionsSummary)

export default router;