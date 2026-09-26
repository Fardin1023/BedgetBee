import mongoose from "mongoose";

export interface User {
  username: string;
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  currency?: string;
}

const userSchema = new mongoose.Schema<User>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    firstName: { type: String },
    lastName: { type: String },
    imageUrl: { type: String },
    currency: { type: String, default: "USD" },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model<User>("User", userSchema);
export default UserModel;
