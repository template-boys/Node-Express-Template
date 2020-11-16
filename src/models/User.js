import { Schema, model } from "mongoose";

// Create Schema
const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  register_date: {
    type: Date,
    default: Date.now,
  },
});

const User = model("user", UserSchema);

export default User;
