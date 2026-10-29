import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

// Models
import { User } from "../models/models.js";
import { Product } from "../models/models.js";
import { Order } from "../models/models.js";
import { Post } from "../models/models.js";
import { Comment } from "../models/models.js";

// Static Data
import { usersData } from "./data.js";
import { productsData } from "./data.js";
import { postsData } from "./data.js";
import { commentTexts } from "./data.js";

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
// 3. USERS: 20 records
// 4 cities (Hyderabad, Mumbai, Bengaluru, Chennai), 3 roles,
// active/inactive mix, ages 15-60, one user with NO address,
// one soft-deleted user.
// ======================================================



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
