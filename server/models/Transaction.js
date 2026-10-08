import mongoose from 'mongoose';

const TRANSACTION_TYPES = ['income', 'expense'];
const CATEGORIES = [
  'salary',
  'freelance',
  'investments',
  'food',
  'transport',
  'housing',
  'utilities',
  'entertainment',
  'healthcare',
  'education',
  'shopping',
  'other',
];

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: {
        values: TRANSACTION_TYPES,
        message: '{VALUE} is not a valid transaction type',
      },
      required: [true, 'Transaction type is required'],
    },
    category: {
      type: String,
      enum: {
        values: CATEGORIES,
        message: '{VALUE} is not a valid category',
      },
      required: [true, 'Category is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index for efficient per-user date-range queries
transactionSchema.index({ user: 1, date: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);
export { TRANSACTION_TYPES, CATEGORIES };
export default Transaction;
