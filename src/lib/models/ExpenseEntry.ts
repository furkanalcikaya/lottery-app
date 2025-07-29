import mongoose from 'mongoose';

const expenseEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'userType'
  },
  userType: {
    type: String,
    required: true,
    enum: ['Business', 'Employee']
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

// Index for efficient querying
expenseEntrySchema.index({ user: 1, date: 1 });
expenseEntrySchema.index({ business: 1, date: 1 });

export const ExpenseEntry = mongoose.models.ExpenseEntry || mongoose.model('ExpenseEntry', expenseEntrySchema); 