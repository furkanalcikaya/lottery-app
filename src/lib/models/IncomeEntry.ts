import mongoose from 'mongoose';

const incomeEntrySchema = new mongoose.Schema({
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
  cashIncome: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  posIncome: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  expenses: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure one entry per user per date
incomeEntrySchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.models.IncomeEntry || mongoose.model('IncomeEntry', incomeEntrySchema); 