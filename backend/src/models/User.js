const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { PHONE_DEPOSIT_STATUS } = require('../constants/phonePenalties');
const { USER_STATUS, USER_ROLE } = require('../constants/user');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    idNumber: {
      type: String,
      required: [true, 'National ID is required'],
      unique: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    profileImage: {
      type: String,
      trim: true,
      default: '',
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLE),
      default: USER_ROLE.STUDENT,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.PENDING_EMAIL_VERIFICATION,
    },
    phoneDepositStatus: {
      type: String,
      enum: Object.values(PHONE_DEPOSIT_STATUS),
      default: PHONE_DEPOSIT_STATUS.NONE,
    },
    phoneDepositStartedAt: {
      type: Date,
      default: null,
    },
    verificationToken: {
      type: String,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

userSchema.index({ role: 1, phoneDepositStatus: 1 });

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) {
    return;
  }

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
  this.password = await bcrypt.hash(this.password, saltRounds);
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.set('toJSON', {
  transform(_doc, ret) {
    const serialized = { ...ret };
    delete serialized.password;
    delete serialized.verificationToken;
    delete serialized.resetPasswordToken;
    delete serialized.resetPasswordExpires;
    delete serialized.__v;
    return serialized;
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
