import { sql } from "../config/db.js"

export async function getTransactionsByUserId(req, res){
    console.log('endpoint hit')
        try {
            const {userId} = req.params
            const userTransactions = await sql`
            SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY created_at DESC
            `
            res.status(200).json(userTransactions)
        } catch (error) {
            console.log('Error fetching user transactions',error)
            res.status(500).json({message:'Internal error'})
        }
    }

export async function createTransaction(req, res) {
    try {
        const {title, amount, category, user_id} = req.body
        if(!title || !user_id || amount === undefined || !category){
           return res.status(400).json({message:"All fields are required"}) 
        }
        const transaction = await sql`
        INSERT INTO transactions(user_id,title,amount,category)
        VALUES (${user_id},${title},${amount},${category})
        RETURNING *
        `
        res.status(201).json(transaction[0])
    } catch (error) {
        console.log('Error creating transaction',error)
        res.status(500).json({message:'Internal error'})
    }
}

export async function updateTransaction(req, res) {
     try {
            const { id } = req.params;
            const { title, amount, category } = req.body;
    
            if (!id) {
                return res.status(400).json({ message: "Transaction ID is required in the URL." });
            }
            if (isNaN(parseInt(id))) {
                return res.status(400).json({ message: "Invalid transaction ID format." });
            }
    
            if (!title || amount === undefined || !category) {
                return res.status(400).json({ message: "All update fields (title, amount, category) are required." });
            }
            if (isNaN(parseFloat(amount))) {
                 return res.status(400).json({ message: "Invalid amount format." });
            }
            const updatedTransactions = await sql`
                UPDATE transactions
                SET
                    title = ${title},
                    amount = ${amount},
                    category = ${category},
                    updated_at = CURRENT_TIMESTAMP
                WHERE
                    id = ${parseInt(id)}
                RETURNING *;
            `;
    
            if (updatedTransactions.length === 0) {
                return res.status(404).json({ message: "Transaction not found." });
            }
    
            res.status(200).json({message:'Transaction updated successfully', transaction: updatedTransactions[0]});
        } catch (error) {
            console.error('Error updating transaction:', error);
            res.status(500).json({ message: 'Internal server error during transaction update.' });
        }
}

export async function getTransactionsSummary(req, res) {
    try {
        const {userId} = req.params
        if(!userId){
            return res.status(400).json({message:"User ID is required"})
        }
        const userSummary = await sql`
        SELECT
            COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) AS total_income,
            COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0) AS total_expenses,
            COALESCE(SUM(amount), 0) AS balance
        FROM
            transactions
        WHERE
            user_id = ${userId}
    `;
        res.status(200).json({
            total_income: userSummary[0].total_income,
            total_expenses: userSummary[0].total_expenses,
            balance: userSummary[0].balance
        })
    } catch (error) {
        console.log('Error fetching transaction summary',error)
        res.status(500).json({message:'Internal error'})
    }
}

export async function deleteTransaction(req, res){
    try {
        const {id} = req.params
        if(!id){
            return res.status(400).json({message:"Transaction ID is required"})
        }

        if(isNaN(parseInt(id))){
            return res.status(400).json({message:"Invalid transaction ID"})
        }

        const deletedTransaction = await sql`
        DELETE FROM transactions WHERE id = ${id} RETURNING *
        `
        if(deletedTransaction.length === 0){
            return res.status(404).json({message:"Transaction not found"})
        }
        res.status(200).json({message:"Transaction deleted successfully", transaction: deletedTransaction[0]})
    } catch (error) {
        console.log('Error deleting transaction',error)
        res.status(500).json({message:'Internal error'})
    }
}