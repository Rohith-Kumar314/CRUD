import express from "express";
import { User } from "./schemas.js";
import { hash } from "bcrypt";
import mongoose from "mongoose";

const app = express();

const asyncWrapper = (fn) => {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
};

function flattenObject(obj, parentKey = "", result = {}) {
  for (const [key, value] of Object.entries(obj)) {
    const path = parentKey ? `${parentKey}.${key}` : key;

    if (typeof value === "object") {
      flattenObject(value, path, result);
    } else {
      result[path] = value;
    }
  }

  return result;
}

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

    const user = await User.findOne({ email }).select("-password");
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User with email Id Already exists",
        data: [],
      });
    }
    const newUser = new User({
      name,
      email,
      password,
      age,
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

app.get(
  "/users/:id",
  asyncWrapper(async (req, res) => {
    const { id } = req.params;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "invalid Object Id", data: [] });
    const isValidId = mongoose.isValidObjectId(id); // for a better development architecture , it should replaced with a middleware
    if (!isValidId)
      return res
        .status(400)
        .json({ success: false, message: "Invalid Object Id", data: [] });

    const user = await User.findById(id).select("-password");
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

function validateObjectId() {
  ///assuming logic exists here, and attaches to the req.user.id
}
// Patch request to update docs.
app.patch(
  "/users/:id",
  validateObjectId,
  asyncWrapper(async (req, res) => {
    const { name, age, address } = req.body; //distructuring the only fields that can be updated and remaining  fields are omitted.
    // const updatedFields = Object.fromEntries(Object.entries({ name, age, address }).filter(
    //   ([_, value]) => value !== null,
    // ));

    const updatedFields = Object.fromEntries(
      Object.entries({ name, age, address }).filter(
        ([_, value]) => value !== undefined,
      ),
    ); // will look into nested objects problem later.

    const updatedDocument = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updatedFields },
      { returnDocument: "after", runValidators: true },
    ).select("-password");

    if (!updatedDocument) {
      return res
        .status(404)
        .json({ success: false, message: "User Not found", data: [] });
    }

    res.status(200).json({
      success: true,
      message: "user updated successfully",
      data: updatedDocument,
    });
  }),
);

app.delete(
  "/users/:id",
  validateObjectId,
  wrapAsync(async (req, res) => {
    const deletedDocument = await User.findByIdAndDelete(req.user.id).select(
      "name _id",
    ); //for more convenience sending user name and id  .
    // delete route should be idempotent, means if the user is not found that means
    // we already obtained the desired state , so we can send the success response
    // but as per the question we are sending not found response;

    if (!deletedDocument)
      return res
        .status(404)
        .json({ success: false, message: "User not found", data: [] }); //adding data field for api consistency

    res.status(200).json({
      success: true,
      message: "User deleted succesfully",
      data: deletedDocument,
    });
  }),
);

app.listen(8080, () => {
  console.log("Server started");
});
