import { Router } from "express";
import mongoose, { Mongoose } from "mongoose";

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: String,
  price: Number,
  pages: Number,
  genre: String,
  tags: [String],
  inStock: Boolean,
  publisher: { name: String, city: String },
  internalNotes: String, // staff-only, must never reach the client
  imageUrl: String,
});

const BooksModel = mongoose.model("book", bookSchema);

export const booksRouter = Router();

// GET allbooks
booksRouter.get("/", async (req, res) => {
  const books = await BooksModel.find({ genre: "scifi" })
    .select("title price")
    .sort("-price")
    .limit(5);
  res
    .status(200)
    .json({ success: true, message: "Data fetched successfully", data: books });
});

// GET books in ASC ORDER

// GET BOOKS ON PAGINATION
