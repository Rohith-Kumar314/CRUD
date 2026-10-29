import mongoose from "mongoose";

const addressSchemaDef = {
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  pincode: { type: String, match: /^\d{6}$/ },
};

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^\S+@\S+\.\S+$/,
    },
    password: { type: String, required: true, minlength: 8 },
    role: { type: String, enum: ["user", "seller", "admin"], default: "user" },
    age: { type: Number, min: 13, max: 120 },
    isActive: { type: Boolean, default: true },
    address: addressSchemaDef,
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ "address.city": 1 });

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    category: { type: String, required: true, trim: true },
    tags: [{ type: String, lowercase: true, trim: true }],
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      avg: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 },
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);
productSchema.index({ isDeleted: 1, category: 1, price: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ title: "text", description: "text", tags: "text" });

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        qty: { type: Number, required: true, min: 1 },
        priceAtPurchase: { type: Number, required: true, min: 0 },
      },
    ],
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    shippingAddress: addressSchemaDef,
  },
  { timestamps: true },
);
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    tags: [{ type: String, lowercase: true, trim: true }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    status: { type: String, enum: ["draft", "published"], default: "draft" },
  },
  { timestamps: true },
);
postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ tags: 1 });

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String, required: true },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
  },
  { timestamps: true },
);
commentSchema.index({ post: 1, createdAt: 1 });
commentSchema.index({ parentComment: 1 });

// ======================================================
// 2. MODELS
// ======================================================

export const User = mongoose.model("User", userSchema);
export const Product = mongoose.model("Product", productSchema);
export const Order = mongoose.model("Order", orderSchema);
export const Post = mongoose.model("Post", postSchema);
export const Comment = mongoose.model("Comment", commentSchema);