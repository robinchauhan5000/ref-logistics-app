import mongoose from 'mongoose';
import { uuid } from 'uuidv4';

const userSchema = new mongoose.Schema(
  {
    //Users who has login ability should go under User schema
    _id: {
      type: String,
      required: true,
      default: () => uuid(),
    },
    name: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    mobile: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    password: {
      type: String,
    },
    activeToken: {
      type: String,
      required: false,
    },
    enabled: {
      type: Number,
      enum: [0, 1, 2], //0 -> disabled, 1 -> enabled, 2 -> blocked
      default: 0,
    },
    role: { type: String, ref: 'Role' },
    isSystemGeneratedPassword: {
      type: Boolean,
      default: false,
    },
    profilePic: {
      type: String,
    },
    invitationSendTime: {
      type: Number,
    },
    addedBy: {
      type: String,
      ref: 'User',
    },
    resetPwdToken: { type: String, default: '' },
    accountLockedAt: {
      type: String,
      default: '',
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    isAccountLocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    strict: true,
    timestamps: true,
  },
);
userSchema.index({ mobile: 1, email: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);
export default User;
