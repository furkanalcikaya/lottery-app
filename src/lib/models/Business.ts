import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  employees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Note: Password is stored in plain text for recovery purposes

// Compare password method (plain text comparison)
businessSchema.methods.comparePassword = async function(candidatePassword: string) {
  return candidatePassword === this.password;
};

export default mongoose.models.Business || mongoose.model('Business', businessSchema); 