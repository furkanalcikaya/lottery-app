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
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
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
  lotteryTicketIncome: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  lotteryScratchIncome: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  lotteryNumericalIncome: {
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

// Remove the unique constraint to allow multiple entries per day
// incomeEntrySchema.index({ user: 1, date: 1 }, { unique: true });

// Add indexes for efficient querying
incomeEntrySchema.index({ business: 1, date: 1 });
incomeEntrySchema.index({ store: 1, date: 1 });
incomeEntrySchema.index({ user: 1, date: 1 });

export default mongoose.models.IncomeEntry || mongoose.model('IncomeEntry', incomeEntrySchema); 