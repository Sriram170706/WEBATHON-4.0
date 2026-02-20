const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Sub-schema for each domain a user registers in
const DomainSchema = new mongoose.Schema({
  domainName: {
    type: String,
    required: true,
    trim: true,
  },
  qualityScore: {
    type: Number,
    default: 0,       // Starts at 0; recalculated as average of ratings
    min: 0,
    max: 5,
  },
  reliabilityScore: {
    type: Number,
    default: 100,     // 100% reliability at start
    min: 0,
    max: 100,
  },
  level: {
    type: Number,
    default: 1,       // Level 1 (Rookie)
  },
  completedTasks: {
    type: Number,
    default: 0,
  },
  beginnerBoostExpiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  },
  cancellations: {
    type: Number,
    default: 0,
  },
  onTimeCompletions: {
    type: Number,
    default: 0,
  },
  // Total tasks assigned (for reliability denominator)
  totalAssigned: {
    type: Number,
    default: 0,
  },
  // Running sum of all ratings received (for quality avg calculation)
  ratingSum: {
    type: Number,
    default: 0,
  },
}, { _id: false });

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // Never return password by default
    },
    role: {
      type: String,
      enum: ['freelancer', 'client', 'both'],
      required: [true, 'Role is required'],
    },
    domains: {
      type: [DomainSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare plain password to hashed
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Helper: find a user's domain object by name
UserSchema.methods.getDomain = function (domainName) {
  return this.domains.find(
    (d) => d.domainName.toLowerCase() === domainName.toLowerCase()
  );
};

module.exports = mongoose.model('User', UserSchema);
