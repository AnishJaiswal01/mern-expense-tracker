import Transaction from '../models/Transaction.js';

// @desc    Get all transactions for the logged-in user
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res) => {
  try {
    // Sort by date descending (newest first)
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new transaction
// @route   POST /api/transactions
// @access  Private
export const createTransaction = async (req, res) => {
  try {
    const { type, category, amount, description, date } = req.body;

    const transaction = await Transaction.create({
      user: req.user.id, // Strictly bound to logged-in user
      type,
      category,
      amount,
      description,
      date,
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get a single transaction
// @route   GET /api/transactions/:id
// @access  Private
export const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Security Check: Verify user owns this transaction
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
export const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Security Check: Verify user owns this transaction
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedTransaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Security Check: Verify user owns this transaction
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await transaction.deleteOne();

    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Seed dummy transactions
// @route   POST /api/transactions/seed
// @access  Private
export const seedTransactions = async (req, res) => {
  try {
    const categories = ['food', 'transport', 'shopping', 'entertainment', 'utilities', 'healthcare', 'education', 'other'];
    const incomeCategories = ['salary', 'freelance', 'investments'];
    
    const transactions = [];
    
    // Generate data for current month and past 3 months
    const today = new Date();
    
    for (let i = 0; i < 4; i++) {
      const month = today.getMonth() - i;
      const year = today.getFullYear();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      // 1 or 2 incomes per month
      transactions.push({
        user: req.user.id,
        type: 'income',
        category: incomeCategories[Math.floor(Math.random() * incomeCategories.length)],
        amount: Math.floor(Math.random() * 50000) + 30000, // 30k to 80k INR
        description: 'Monthly Income',
        date: new Date(year, month, 5),
      });

      // 10-15 expenses per month
      const numExpenses = Math.floor(Math.random() * 6) + 10;
      for (let j = 0; j < numExpenses; j++) {
        const randomDay = Math.floor(Math.random() * daysInMonth) + 1;
        transactions.push({
          user: req.user.id,
          type: 'expense',
          category: categories[Math.floor(Math.random() * categories.length)],
          amount: Math.floor(Math.random() * 4500) + 100, // 100 to 4600 INR
          description: `Dummy Expense ${j+1}`,
          date: new Date(year, month, randomDay),
        });
      }
    }

    await Transaction.insertMany(transactions);
    res.status(201).json({ message: 'Seeded successfully', count: transactions.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
