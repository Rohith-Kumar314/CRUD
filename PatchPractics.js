import express from "express";
import mongoose from "mongoose";
import morgan, { format } from "morgan";
import { hash } from "bcrypt";
import { config } from "dotenv";

config();

const app = express();
const DBUrl = "mongodb://127.0.0.1:27017/patchPractice";
const PORT = process.env.PORT || 2002;

// Middlewares
app.use(morgan(format("strict")));
app.use(express.json());

const userSchema = new mongoose.Schema(
  {
    name: String,
    age: Number,
    email: String,
    password: {
      type: String,
      require: true,
      select: false,
    },
    address: {
      street: String,
      city: String,
      pincode: Number,
    },
  },
  { timestamps: true },
);

const UserModel = mongoose.model("UserModel", userSchema);

function asyncWrapper(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Server is up", data: [] });
});

app.get("/users", async (req, res) => {
  try {
    const allUsers = await UserModel.find();
    console.log("ALL Users : ", allUsers);
    res.status(200).json({
      success: true,
      message: "All Users fetched successfully",
      data: allUsers,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server error", data: [] });
  }
});

app.post(
  "/users",
  asyncWrapper(async (req, res) => {
    const { name, email, password, age, address } = req.body; //this ensures that other fields are omitted.
    if (!name || !email || !password || !age)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required", data: [] }); //passing ddata for api consistency. when we add a middleware we can send specific missing fields.

    const user = await UserModel.findOne({ email }).select("-password");
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User with email Id Already exists",
        data: [],
      });
    }
    const newUser = new UserModel({
      name,
      email,
      password,
      age,
      address,
    });

    await newUser.validate(); // throws an error, if any fields are wrong
    newUser.password = await hash(newUser.password, 10); //hashing the password and directly storing it here.

    const response = await newUser.save({ validateBeforeSave: false });
    if (!response) {
      return res.status(500).json({
        status: false,
        message: "Some error occurred",
        data: [],
      });
    }

    const userObj = newUser.toObject();
    delete userObj.password;

    res.status(201).json({
      success: true,
      message: "User added succesfully",
      data: userObj,
    });
  }),
);

app.patch("/users/:userId", async (req, res) => {
  const { userId } = req.params;
  const isValidId = mongoose.isValidObjectId(userId);
  if (!isValidId)
    return res
      .status(400)
      .json({ success: false, message: "Bad request", data: [] });

  const updatedUser = await UserModel.findByIdAndUpdate(userId, req.body, {
    returnDocument: "after",
    runValidators: true,
  });

  if (!updatedUser)
    return res
      .status(404)
      .json({ success: false, message: "User not found", data: [] });

      res.status(200).json({success:true, message:"User updated successfully",data:updatedUser});
});

async function connectDB() {
  try {
    await mongoose.connect(DBUrl);
    console.log("DB Connected");
    app.listen(PORT, () => {
      console.log("Server Started");
    });
  } catch (err) {
    console.log("=========ERROR IN DB CONNECTION=========", err);
  }
}

connectDB();
