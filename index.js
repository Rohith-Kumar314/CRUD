import express from "express";
import mongoose from "mongoose";
import { userRouter } from "./routes/userRouter.js";
import morgan, { format } from "morgan";

const app = express();
app.use(
  morgan(":method :url :status :response-time ms - :res[content-length] bytes"),
);

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sample_store";

app.use("/users", userRouter);

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`Connected to MongoDB (db: ${mongoose.connection.name}).`);

    app.listen(8080, () => {
      console.log("Server started");
    });
  } catch (err) {
    console.log("Server Connection Error: ", err);
  }
}

connectDB();
