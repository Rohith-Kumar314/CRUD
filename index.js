import express from "express";
import { User } from "./schemas.js";
import { hash } from "bcrypt";
import mongoose from "mongoose";

const app = express();

const asyncWrapper = (fn) => {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
};

app.get(
  "/users",
  asyncWrapper(async (req, res) => {
    const allUsers = await User.find({}).select("-password -__v -gender");
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: allUsers,
    });
  }),
);

// Without asyncwrapper using try catch block for get
app.get("/users", async (req, res) => {
  try {
    const allUsers = await User.find({}).select("-password -__v -gender");
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: allUsers,
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Internal server error", data: [] }); //need to update to logic which type of error in other functions. but for most of the get requests it will be internal error only when no query params added.
  }
});

app.post(
  "/users",
  asyncWrapper(async (req, res) => {
    const { name, email, password, age } = req.body; //this ensures that other fields are omitted.

    if (!name || !email || !password || !age)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required", data: [] }); //passing ddata for api consistency. when we add a middleware we can send specific missing fields.

    const hashedPassword = await hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      age,
    });

    const response = await newUser.save();
    if (!response) {
      return res.status(500).json({
        status: false,
        message: "Some error occurred",
        data: [],
      });
    }

    delete newUser.password;

    res.status(201).json({
      success: true,
      message: "User added succesfully",
      data: newUser,
    });
  }),
);

app.get(
  "/users/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "invalid Object Id", data: [] });
    const isValidId = mongoose.isValidObjectId(id);
    if (!isValidId)
      return res
        .status(400)
        .json({ success: false, message: "Invalid Object Id", data: [] });

    const user = await User.findOne({ id }).select("-password"); //using find one because it returns document, find returns cursor;
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found", data: [] });
    }
    res
      .status(200)
      .json({ success: true, message: "User fetched succesfully", data: user });
  }),
);

app.listen(8080, () => {
  console.log("Server started");
});
