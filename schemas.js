// User
import mongoose, { mongo } from "mongoose";
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2 },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 8 },
    role: { type: String, enum: ["user", "seller", "admin"], default: "user" },
    age: { type: Number, min: 13, max: 120 },
    isActive: { type: Boolean, default: true },
    address: { city: String, state: String, pincode: String }, // embedded subdocument
    deletedAt: { type: Date, default: null },
    // timestamps: true
  },
  { timestamps: true },
);

const productSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, default: 0, min: 0 },
  category: { type: String, required: true },
  tags: [String],
  seller: { type: ObjectId, ref: "User", required: true },
  rating: {
    avg: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
  isDeleted: { type: Boolean, default: false },
  // timestamps: true
});

const orderSchema = new mongoose.Schema({
  user: { type: ObjectId, ref: "User", required: true },
  items: [
    {
      product: { type: ObjectId, ref: "Product" },
      qty: Number,
      priceAtPurchase: Number,
    },
  ],
  totalAmount: Number,
  status: {
    type: String,
    enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  shippingAddress: { city: String, state: String, pincode: String },
  // timestamps: true
});

// Post
const postSchema = new mongoose.Schema({
  author: { type: ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: [String],
  likes: [{ type: ObjectId, ref: "User" }],
  status: { type: String, enum: ["draft", "published"], default: "draft" },
  // timestamps: true
});

const commentSchema = new mongoose.Schema({
  post: { type: ObjectId, ref: "Post", required: true },
  author: { type: ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  parentComment: { type: ObjectId, ref: "Comment", default: null },
  // timestamps: true
});

export const User = mongoose.model("User", userSchema);
