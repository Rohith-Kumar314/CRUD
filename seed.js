// seed.js
// Usage:  node seed.js            (needs "type": "module" in package.json, or rename to seed.mjs)
//         node seed.js --force    (required if NODE_ENV=production)

import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sample_store";
const DEMO_PASSWORD = "DemoPass123!";

// Helper: a date N days in the past (optionally shifted by hours) so that
// createdAt/updatedAt differ between documents. Without this every document
// gets the same timestamp and sorting / cursor pagination by createdAt is
// impossible to test.
const daysAgo = (days, hours = 0) =>
  new Date(Date.now() - days * 86_400_000 - hours * 3_600_000);

// ======================================================
// 1. SCHEMAS
// ======================================================

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

const User = mongoose.model("User", userSchema);
const Product = mongoose.model("Product", productSchema);
const Order = mongoose.model("Order", orderSchema);
const Post = mongoose.model("Post", postSchema);
const Comment = mongoose.model("Comment", commentSchema);

// ======================================================
// 3. USERS: 20 records
// 4 cities (Hyderabad, Mumbai, Bengaluru, Chennai), 3 roles,
// active/inactive mix, ages 15-60, one user with NO address,
// one soft-deleted user.
// ======================================================

const usersData = [
  {
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    role: "admin",
    age: 60,
    isActive: true,
    address: { city: "Hyderabad", state: "Telangana", pincode: "500001" },
  },
  {
    name: "Priya Reddy",
    email: "priya.reddy@example.com",
    role: "seller",
    age: 29,
    isActive: true,
    address: { city: "Hyderabad", state: "Telangana", pincode: "500034" },
  },
  {
    name: "Rahul Mehta",
    email: "rahul.mehta@example.com",
    role: "seller",
    age: 34,
    isActive: false,
    address: { city: "Mumbai", state: "Maharashtra", pincode: "400001" },
  },
  {
    name: "Ananya Iyer",
    email: "ananya.iyer@example.com",
    role: "seller",
    age: 27,
    isActive: true,
    address: { city: "Bengaluru", state: "Karnataka", pincode: "560001" },
  },
  {
    name: "Vikram Patel",
    email: "vikram.patel@example.com",
    role: "seller",
    age: 38,
    isActive: false,
    address: { city: "Chennai", state: "Tamil Nadu", pincode: "600001" },
  },
  {
    name: "Sneha Kulkarni",
    email: "sneha.kulkarni@example.com",
    role: "user",
    age: 26,
    isActive: true,
    address: { city: "Bengaluru", state: "Karnataka", pincode: "560076" },
  },
  {
    name: "Arjun Nair",
    email: "arjun.nair@example.com",
    role: "user",
    age: 31,
    isActive: true,
    address: { city: "Hyderabad", state: "Telangana", pincode: "500016" },
  },
  {
    name: "Meera Krishnan",
    email: "meera.krishnan@example.com",
    role: "user",
    age: 15,
    isActive: false,
    address: { city: "Mumbai", state: "Maharashtra", pincode: "400020" },
  },
  {
    name: "Rohan Desai",
    email: "rohan.desai@example.com",
    role: "user",
    age: 35,
    isActive: true,
    address: { city: "Bengaluru", state: "Karnataka", pincode: "560034" },
  },
  {
    name: "Kavya Menon",
    email: "kavya.menon@example.com",
    role: "user",
    age: 28,
    isActive: true,
    address: { city: "Chennai", state: "Tamil Nadu", pincode: "600018" },
  },
  {
    name: "Aditya Verma",
    email: "aditya.verma@example.com",
    role: "user",
    age: 30,
    isActive: false,
    address: { city: "Hyderabad", state: "Telangana", pincode: "500032" },
  },
  {
    name: "Ishita Bose",
    email: "ishita.bose@example.com",
    role: "user",
    age: 23,
    isActive: true,
    address: { city: "Mumbai", state: "Maharashtra", pincode: "400050" },
  },
  {
    name: "Karan Malhotra",
    email: "karan.malhotra@example.com",
    role: "admin",
    age: 37,
    isActive: true,
    address: { city: "Bengaluru", state: "Karnataka", pincode: "560100" },
  },
  {
    name: "Divya Srinivasan",
    email: "divya.srinivasan@example.com",
    role: "user",
    age: 33,
    isActive: false,
    address: { city: "Chennai", state: "Tamil Nadu", pincode: "641001" },
  },
  {
    name: "Nikhil Joshi",
    email: "nikhil.joshi@example.com",
    role: "user",
    age: 25,
    isActive: true,
    address: { city: "Hyderabad", state: "Telangana", pincode: "500081" },
  },
  {
    name: "Pooja Chatterjee",
    email: "pooja.chatterjee@example.com",
    role: "user",
    age: 29,
    isActive: true,
    address: { city: "Mumbai", state: "Maharashtra", pincode: "400070" },
  },
  {
    name: "Siddharth Rao",
    email: "siddharth.rao@example.com",
    role: "user",
    age: 40,
    isActive: false,
    address: { city: "Bengaluru", state: "Karnataka", pincode: "560001" },
  },
  {
    name: "Neha Kapoor",
    email: "neha.kapoor@example.com",
    role: "user",
    age: 22,
    isActive: true,
    address: { city: "Chennai", state: "Tamil Nadu", pincode: "600040" },
  },
  // Intentionally NO address field at all.
  {
    name: "Manish Gupta",
    email: "manish.gupta@example.com",
    role: "user",
    age: 36,
    isActive: true,
  },
  // Inactive AND soft-deleted.
  {
    name: "Tanvi Shah",
    email: "tanvi.shah@example.com",
    role: "user",
    age: 19,
    isActive: false,
    address: { city: "Hyderabad", state: "Telangana", pincode: "500084" },
    deletedAt: daysAgo(10),
  },
];

// ======================================================
// 5. PRODUCTS: 25 records
// sellerIndex refers to the position in the list of users whose role is "seller"
// (0 = Priya, 1 = Rahul, 2 = Ananya, 3 = Vikram).
// Includes: 3 zero-stock, 2 soft-deleted, duplicate prices
// (2499, 899, 499, and 599 incl. a deleted one), one unrated product.
// ======================================================

const productsData = [
  {
    title: "Wireless Bluetooth Headphones",
    description: "Over-ear headphones for music, calls, and commuting.",
    price: 2499,
    stock: 45,
    category: "Electronics",
    tags: ["audio", "wireless", "bluetooth"],
    sellerIndex: 0,
    rating: { avg: 4.4, count: 128 },
  },
  {
    title: "Mechanical Gaming Keyboard",
    description: "RGB keyboard with tactile switches for gaming and typing.",
    price: 3499,
    stock: 30,
    category: "Electronics",
    tags: ["gaming", "keyboard", "computer"],
    sellerIndex: 1,
    rating: { avg: 4.6, count: 86 },
  },
  {
    title: "Stainless Steel Water Bottle",
    description: "Reusable insulated bottle for work and travel.",
    price: 799,
    stock: 100,
    category: "Home",
    tags: ["bottle", "reusable", "travel"],
    sellerIndex: 2,
    rating: { avg: 4.2, count: 64 },
  },
  {
    title: "Cotton Casual T-Shirt",
    description: "Everyday cotton T-shirt with a regular fit.",
    price: 599,
    stock: 80,
    category: "Fashion",
    tags: ["clothing", "cotton", "casual"],
    sellerIndex: 3,
    rating: { avg: 4.1, count: 52 },
  },
  {
    title: "Running Shoes",
    description: "Lightweight athletic shoes for everyday running.",
    price: 2299,
    stock: 35,
    category: "Footwear",
    tags: ["shoes", "running", "sports"],
    sellerIndex: 0,
    rating: { avg: 4.3, count: 91 },
  },
  {
    title: "Ceramic Coffee Mug Set",
    description: "Two ceramic mugs for coffee and tea.",
    price: 499,
    stock: 60,
    category: "Home",
    tags: ["kitchen", "coffee", "ceramic"],
    sellerIndex: 1,
    rating: { avg: 4.5, count: 38 },
  },
  {
    title: "Laptop Backpack",
    description: "Water-resistant backpack with a padded laptop compartment.",
    price: 1599,
    stock: 42,
    category: "Accessories",
    tags: ["backpack", "laptop", "travel"],
    sellerIndex: 2,
    rating: { avg: 4.4, count: 73 },
  },
  {
    title: "Yoga Exercise Mat",
    description: "Non-slip exercise mat for yoga and stretching.",
    price: 999,
    stock: 0,
    category: "Fitness",
    tags: ["yoga", "fitness", "exercise"],
    sellerIndex: 3,
    rating: { avg: 4.2, count: 46 },
  },
  {
    title: "LED Desk Lamp",
    description: "Adjustable LED lamp for reading and office desks.",
    price: 1199,
    stock: 28,
    category: "Home",
    tags: ["lighting", "desk", "office"],
    sellerIndex: 0,
    rating: { avg: 4.3, count: 57 },
  },
  {
    title: "Portable Power Bank",
    description: "Compact power bank for charging mobile devices.",
    price: 1399,
    stock: 50,
    category: "Electronics",
    tags: ["charging", "mobile", "travel"],
    sellerIndex: 1,
    rating: { avg: 4.1, count: 103 },
  },
  {
    title: "Classic Analog Wristwatch",
    description: "Minimal analog watch with a stainless steel case.",
    price: 2799,
    stock: 22,
    category: "Accessories",
    tags: ["watch", "fashion", "accessories"],
    sellerIndex: 2,
    rating: { avg: 4.5, count: 41 },
  },
  {
    title: "Non-Stick Frying Pan",
    description: "Everyday frying pan for home cooking.",
    price: 899,
    stock: 40,
    category: "Kitchen",
    tags: ["cookware", "kitchen", "cooking"],
    sellerIndex: 3,
    rating: { avg: 4.0, count: 32 },
  },
  {
    title: "Organic Green Tea",
    description: "Green tea leaves for a refreshing hot beverage.",
    price: 349,
    stock: 75,
    category: "Grocery",
    tags: ["tea", "beverage", "organic"],
    sellerIndex: 0,
    rating: { avg: 4.3, count: 66 },
  },
  {
    title: "Travel Neck Pillow",
    description: "Soft neck pillow for long journeys.",
    price: 699,
    stock: 0,
    category: "Travel",
    tags: ["travel", "comfort", "pillow"],
    sellerIndex: 1,
    rating: { avg: 4.2, count: 29 },
  },
  {
    title: "Wireless Computer Mouse",
    description: "Ergonomic wireless mouse for home and office.",
    price: 899,
    stock: 65,
    category: "Electronics",
    tags: ["computer", "mouse", "wireless"],
    sellerIndex: 2,
    rating: { avg: 4.4, count: 112 },
  },
  {
    title: "Printed Cotton Bedsheet",
    description: "Cotton bedsheet with a contemporary printed design.",
    price: 1299,
    stock: 27,
    category: "Home",
    tags: ["bedding", "cotton", "bedroom"],
    sellerIndex: 3,
    rating: { avg: 4.1, count: 35 },
  },
  // Brand-new listing: no ratings yet.
  {
    title: "Insulated Lunch Box",
    description: "Compact lunch box for work, school, and travel.",
    price: 649,
    stock: 48,
    category: "Kitchen",
    tags: ["lunch", "food-storage", "office"],
    sellerIndex: 0,
    rating: { avg: 0, count: 0 },
  },
  {
    title: "Resistance Band Set",
    description: "Multiple resistance levels for home workouts.",
    price: 549,
    stock: 58,
    category: "Fitness",
    tags: ["fitness", "workout", "exercise"],
    sellerIndex: 1,
    rating: { avg: 4.3, count: 49 },
  },
  {
    title: "Hardcover Notebook",
    description: "Ruled notebook for notes, planning, and journaling.",
    price: 299,
    stock: 90,
    category: "Stationery",
    tags: ["notebook", "writing", "office"],
    sellerIndex: 2,
    rating: { avg: 4.2, count: 44 },
  },
  {
    title: "UV Protection Sunglasses",
    description: "Everyday sunglasses with UV-protective lenses.",
    price: 1099,
    stock: 31,
    category: "Accessories",
    tags: ["sunglasses", "fashion", "outdoor"],
    sellerIndex: 3,
    rating: { avg: 4.1, count: 37 },
  },
  // Same price as the first headphones (2499) and out of stock.
  {
    title: "Bluetooth Gaming Headset",
    description: "Wireless headset for gaming and online calls.",
    price: 2499,
    stock: 0,
    category: "Electronics",
    tags: ["wireless", "bluetooth", "gaming"],
    sellerIndex: 0,
    rating: { avg: 4.5, count: 94 },
  },
  {
    title: "Portable Bluetooth Speaker",
    description: "Compact wireless speaker for indoor and outdoor listening.",
    price: 1799,
    stock: 36,
    category: "Electronics",
    tags: ["wireless", "bluetooth", "audio"],
    sellerIndex: 1,
    rating: { avg: 4.3, count: 71 },
  },
  {
    title: "Gaming Mouse Pad",
    description: "Extended desk mat with a smooth surface for gaming.",
    price: 499,
    stock: 54,
    category: "Electronics",
    tags: ["gaming", "computer", "accessories"],
    sellerIndex: 2,
    rating: { avg: 4.2, count: 62 },
  },
  // Soft-deleted.
  {
    title: "Classic Cotton T-Shirt",
    description: "Cotton crew-neck T-shirt for everyday wear.",
    price: 599,
    stock: 24,
    category: "Fashion",
    tags: ["clothing", "cotton", "casual"],
    sellerIndex: 3,
    rating: { avg: 3.9, count: 18 },
    isDeleted: true,
  },
  // Soft-deleted.
  {
    title: "Wireless Charging Stand",
    description: "Desk charging stand for compatible wireless devices.",
    price: 1499,
    stock: 12,
    category: "Electronics",
    tags: ["wireless", "charging", "mobile"],
    sellerIndex: 0,
    rating: { avg: 4.0, count: 21 },
    isDeleted: true,
  },
];

// ======================================================
// 6. POSTS: 20 records (4 drafts, 16 published)
// ======================================================

const postsData = [
  {
    title: "How to Build a Productive Morning Routine",
    content:
      "Start with a realistic wake-up time, drink water, and plan three priorities for the day.",
    tags: ["productivity", "habits", "lifestyle"],
  },
  {
    title: "A Beginner's Guide to Mechanical Keyboards",
    content:
      "Compare switch feel, sound, layout, and typing comfort before choosing a keyboard.",
    tags: ["technology", "keyboards", "computers"],
  },
  {
    title: "Simple Ways to Reduce Household Waste",
    content:
      "Reusable bottles, shopping bags, meal planning, and careful purchasing can reduce waste.",
    tags: ["sustainability", "home", "environment"],
  },
  {
    title: "Planning a Weekend Trip on a Budget",
    content:
      "Choose a nearby destination, compare transport options, and set a realistic spending limit.",
    tags: ["travel", "budget", "planning"],
  },
  {
    title: "Setting Up a Comfortable Home Office",
    content:
      "Good lighting, a suitable chair, and a properly positioned monitor can improve a workspace.",
    tags: ["office", "work", "productivity"],
  },
  {
    title: "Everyday Fitness Without a Gym",
    content:
      "Walking, bodyweight exercises, and resistance bands offer flexible ways to exercise at home.",
    tags: ["fitness", "health", "exercise"],
  },
  {
    title: "Choosing the Right Backpack",
    content:
      "Consider carrying comfort, laptop size, pockets, and weather resistance when choosing a bag.",
    tags: ["accessories", "travel", "shopping"],
  },
  {
    title: "Making Better Coffee at Home",
    content:
      "Fresh coffee, clean equipment, and consistent measurements can improve your daily brew.",
    tags: ["coffee", "food", "lifestyle"],
  },
  {
    title: "Organizing a Small Kitchen",
    content:
      "Group similar tools together and store everyday items near where you use them.",
    tags: ["kitchen", "organization", "home"],
  },
  {
    title: "Getting Started with Personal Budgeting",
    content:
      "Track expenses, identify essential costs, and set a savings goal you can review regularly.",
    tags: ["finance", "budget", "planning"],
  },
  {
    title: "A Practical Guide to Laptop Care",
    content:
      "Keep ventilation clear, install security updates, and back up important files regularly.",
    tags: ["technology", "laptops", "maintenance"],
  },
  {
    title: "Creating a Reading Habit",
    content: "Keep a book nearby and begin with a small daily reading target.",
    tags: ["books", "habits", "learning"],
  },
  {
    title: "Packing Light for a Short Holiday",
    content:
      "Plan versatile outfits, check the forecast, and keep documents and chargers accessible.",
    tags: ["travel", "packing", "tips"],
  },
  {
    title: "Simple Indoor Plant Care Tips",
    content:
      "Learn each plant's light needs, check soil moisture, and use pots with suitable drainage.",
    tags: ["plants", "gardening", "home"],
  },
  {
    title: "Making Online Shopping More Thoughtful",
    content:
      "Compare specifications, read descriptions, and check return policies before ordering.",
    tags: ["shopping", "consumer-tips", "lifestyle"],
  },
  {
    title: "Why Walking Breaks Matter During Work",
    content:
      "Short breaks offer opportunities to stretch, change posture, and rest your eyes.",
    tags: ["wellness", "work", "fitness"],
  },
  {
    title: "Building a Simple Weekly Meal Plan",
    content:
      "Plan a few meals, reuse ingredients, and make a shopping list before visiting the store.",
    tags: ["cooking", "meal-planning", "food"],
  },
  {
    title: "Keeping Digital Files Organized",
    content:
      "Descriptive file names and consistent folder structures make documents easier to find.",
    tags: ["technology", "organization", "productivity"],
  },
  {
    title: "What to Look for in Wireless Headphones",
    content:
      "Compare battery life, comfort, microphone quality, and device compatibility.",
    tags: ["audio", "technology", "buying-guide"],
  },
  {
    title: "Creating a Relaxing Evening Routine",
    content:
      "Preparing for tomorrow and choosing a relaxing activity can create a calmer evening.",
    tags: ["sleep", "habits", "lifestyle"],
  },
];

// ======================================================
// 7. COMMENTS: 30 records (first 16 top-level, then a mix of replies/top-level)
// ======================================================

const commentTexts = [
  "This is a useful guide. Thanks for sharing!",
  "I have been looking for practical advice like this.",
  "The tips are simple and easy to follow.",
  "I would recommend starting with a small change.",
  "Great explanation. I will try this approach.",
  "This worked well for my everyday routine.",
  "Could you share more examples on this topic?",
  "I appreciate the clear breakdown.",
  "Good point about choosing what works for your needs.",
  "This is a helpful reminder.",
  "Consistency makes a big difference.",
  "Thanks for putting these ideas together.",
  "I learned something new from this post.",
  "The examples make this easier to understand.",
  "Looking forward to reading more posts like this.",
  "That is a good suggestion for beginners.",
  "I would love to see a follow-up article.",
  "This gives me a few ideas to try this week.",
  "Clear and informative. Thanks!",
  "I like how you kept the advice straightforward.",
  "A very useful perspective on the subject.",
  "I will share this with a friend.",
  "This is worth bookmarking for later.",
  "The checklist idea is especially helpful.",
  "Nice summary of the important points.",
  "Could you explain this in more detail?",
  "I tried something similar and found it helpful.",
  "Thanks! This is easy to understand.",
  "I agree with your point about keeping things simple.",
  "I will keep these suggestions in mind.",
];

// ======================================================
// 8. SEED DATABASE
// ======================================================

async function seedDatabase() {
  try {
    if (
      process.env.NODE_ENV === "production" &&
      !process.argv.includes("--force")
    ) {
      throw new Error(
        "Refusing to wipe a database while NODE_ENV=production. Re-run with --force if you really mean it.",
      );
    }

    await mongoose.connect(MONGO_URI);
    console.log(`Connected to MongoDB (db: ${mongoose.connection.name}).`);

    // Make sure indexes (incl. the unique email index) exist before inserting.
    await Promise.all(
      [User, Product, Order, Post, Comment].map((model) => model.init()),
    );

    // IMPORTANT: permanently deletes all documents in these five collections.
    console.log("Deleting existing documents...");
    const deleteResults = await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
      Post.deleteMany({}),
      Comment.deleteMany({}),
    ]);
    console.log(
      "Existing documents deleted:",
      deleteResults.reduce((sum, r) => sum + r.deletedCount, 0),
    );

    // ---------- USERS ----------
    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

    const users = await User.insertMany(
      usersData.map((user, i) => ({
        ...user,
        password: hashedPassword,
        deletedAt: user.deletedAt ?? null,
        createdAt: daysAgo(120 - i * 5),
      })),
    );
    console.log(`Inserted ${users.length} users.`);

    const sellers = users.filter((u) => u.role === "seller");
    const activeUsers = users.filter((u) => u.isActive && !u.deletedAt);
    const buyers = activeUsers.filter((u) => u.role === "user");

    // ---------- PRODUCTS ----------
    const products = await Product.insertMany(
      productsData.map(({ sellerIndex, ...fields }, i) => {
        const seller = sellers[sellerIndex];
        if (!seller) {
          throw new Error(
            `Product "${fields.title}" has invalid sellerIndex ${sellerIndex}`,
          );
        }
        return {
          ...fields,
          isDeleted: fields.isDeleted ?? false,
          seller: seller._id,
          createdAt: daysAgo(100 - i * 3),
        };
      }),
    );
    console.log(`Inserted ${products.length} products.`);

    // ---------- ORDERS ----------
    // Only orderable products (not deleted, in stock) and active buyers.
    const orderable = products.filter((p) => !p.isDeleted && p.stock > 0);

    const orderStatuses = [
      "delivered",
      "delivered",
      "shipped",
      "paid",
      "pending",
      "cancelled",
      "delivered",
      "paid",
      "shipped",
      "delivered",
      "pending",
      "paid",
      "delivered",
      "shipped",
      "paid",
      "delivered",
      "pending",
      "cancelled",
      "shipped",
      "delivered",
    ];

    const ordersData = orderStatuses.map((status, i) => {
      const buyer = buyers[i % buyers.length];
      const first = orderable[i % orderable.length];
      const second = orderable[(i + 7) % orderable.length];

      const items = [
        { product: first._id, qty: (i % 3) + 1, priceAtPurchase: first.price },
      ];
      if (i % 2 === 0 && second._id.toString() !== first._id.toString()) {
        items.push({
          product: second._id,
          qty: 2,
          priceAtPurchase: second.price,
        });
      }

      const totalAmount = items.reduce(
        (sum, item) => sum + item.qty * item.priceAtPurchase,
        0,
      );

      return {
        user: buyer._id,
        items,
        totalAmount,
        status,
        // Buyer without an address simply gets no shippingAddress.
        ...(buyer.address?.city
          ? {
              shippingAddress: {
                city: buyer.address.city,
                state: buyer.address.state,
                pincode: buyer.address.pincode,
              },
            }
          : {}),
        createdAt: daysAgo(60 - i * 3, i),
      };
    });

    const orders = await Order.insertMany(ordersData);
    console.log(`Inserted ${orders.length} orders.`);

    // ---------- POSTS ----------
    const posts = await Post.insertMany(
      postsData.map((post, i) => {
        const author = activeUsers[i % activeUsers.length];
        const status = i % 5 === 0 ? "draft" : "published";

        // Only published posts have likes; the author never likes their own post.
        const likes =
          status === "published"
            ? activeUsers
                .filter((u) => u._id.toString() !== author._id.toString())
                .filter((_, idx) => (idx + i) % 3 === 0)
                .slice(0, 3 + (i % 4))
                .map((u) => u._id)
            : [];

        return {
          ...post,
          author: author._id,
          likes,
          status,
          createdAt: daysAgo(60 - i * 2, i),
        };
      }),
    );
    console.log(`Inserted ${posts.length} posts.`);

    // ---------- COMMENTS ----------
    // Comments only go on published posts. Replies point to a top-level
    // comment on the same post, written by a different person, and are dated
    // after their parent. _ids are generated up front so parents and replies
    // can be inserted in a single call.
    const publishedPosts = posts.filter((p) => p.status === "published");
    const topLevelByPost = new Map();
    const commentsData = [];

    commentTexts.forEach((text, i) => {
      const post = publishedPosts[i % publishedPosts.length];
      const parent =
        i >= publishedPosts.length && i % 2 === 0
          ? topLevelByPost.get(post._id.toString())
          : null;

      const exclude = [post.author.toString()];
      if (parent) exclude.push(parent.author.toString());

      let author = null;
      for (let k = 0; k < activeUsers.length && !author; k++) {
        const candidate = activeUsers[(i * 3 + 1 + k) % activeUsers.length];
        if (!exclude.includes(candidate._id.toString())) author = candidate;
      }

      const base = parent ? parent.createdAt : post.createdAt;
      const comment = {
        _id: new mongoose.Types.ObjectId(),
        post: post._id,
        author: author._id,
        text,
        parentComment: parent ? parent._id : null,
        createdAt: new Date(base.getTime() + (i + 1) * 5 * 3_600_000),
      };

      if (!parent) topLevelByPost.set(post._id.toString(), comment);
      commentsData.push(comment);
    });

    const comments = await Comment.insertMany(commentsData);
    console.log(`Inserted ${comments.length} comments.`);

    // ---------- SUMMARY & SANITY CHECKS ----------
    const [
      userCount,
      productCount,
      orderCount,
      postCount,
      commentCount,
      inactiveUsers,
      missingAddressUsers,
      zeroStockProducts,
      deletedProducts,
      duplicatePrices,
      roleCounts,
      cityCounts,
      replyCount,
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Post.countDocuments(),
      Comment.countDocuments(),
      User.countDocuments({ isActive: false }),
      User.countDocuments({ address: { $exists: false } }),
      Product.countDocuments({ stock: 0 }),
      Product.countDocuments({ isDeleted: true }),
      Product.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: "$price", count: { $sum: 1 } } },
        { $match: { count: { $gte: 2 } } },
        { $sort: { _id: 1 } },
      ]),
      User.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      User.aggregate([
        { $match: { "address.city": { $exists: true } } },
        { $group: { _id: "$address.city", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Comment.countDocuments({ parentComment: { $ne: null } }),
    ]);

    console.log("\n========== SEED SUMMARY ==========");
    console.log(`Users:    ${userCount}`);
    console.log(`Products: ${productCount}`);
    console.log(`Orders:   ${orderCount}`);
    console.log(`Posts:    ${postCount}`);
    console.log(`Comments: ${commentCount} (${replyCount} replies)`);

    console.log("\n========== FILTER TEST DATA ==========");
    console.log(
      `Roles: ${roleCounts.map((r) => `${r._id}=${r.count}`).join(", ")}`,
    );
    console.log(
      `Cities: ${cityCounts.map((c) => `${c._id}=${c.count}`).join(", ")}`,
    );
    console.log(`Inactive users: ${inactiveUsers}`);
    console.log(`Users without address: ${missingAddressUsers}`);
    console.log(`Zero-stock products: ${zeroStockProducts}`);
    console.log(`Soft-deleted products: ${deletedProducts}`);
    console.log(
      `Prices shared by 2+ active products: ${duplicatePrices.map((d) => d._id).join(", ")}`,
    );
    console.log("======================================");

    if (
      userCount < 8 ||
      productCount < 25 ||
      missingAddressUsers < 1 ||
      zeroStockProducts < 1 ||
      deletedProducts < 1 ||
      duplicatePrices.length < 1
    ) {
      throw new Error("Seed data does not meet the minimum test requirements.");
    }

    console.log("\nDemo login credentials (all users share this password):");
    console.log("Admin email: aarav.sharma@example.com");
    console.log(`Password:    ${DEMO_PASSWORD}`);
    console.log("\nSeeding completed successfully.");
  } catch (error) {
    console.error("\nSeeding failed:");
    console.error(error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
  }
}

seedDatabase();
