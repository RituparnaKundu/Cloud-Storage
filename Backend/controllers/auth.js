import bycrpt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/Users.js";
import mongoose from "mongoose";


// Register
export const register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const oldUser = await User.findOne({ email });
    if (oldUser)
      return res.status(400).json({ message: "User Already Exists" });
    const encryptedPassword = await bycrpt.hash(password, 12);
    const result = await User.create({
      email,
      password: encryptedPassword,
        firstName,
        lastName,
    });
    const token = jwt.sign(
      { email: result.email, id: result._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(201).json({ result, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    console.log(error);
  }
};

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const oldUser = await User.findOne({ email });
    if (!oldUser)
      return res.status(404).json({ message: "User doesn't exist" });
    const isPasswordCorrect = await bycrpt.compare(password, oldUser.password);
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign(
      { email: oldUser.email, id: oldUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ result: oldUser, token });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
// Update User
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, password } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send(`No user with id: ${id}`);
  const updatedUser = { firstName, lastName, email, password, _id: id };
  await User.findByIdAndUpdate(id, updatedUser, { new: true });
  res.json(updatedUser);
};
// Delete User
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send(`No user with id: ${id}`);
  await User.findByIdAndRemove(id);
  res.json({ message: "User deleted successfully" });
};
// Get User
export const getUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
// Get All Users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
// Get User Files
export const getUserFiles = async (req, res) => {
  const { id } = req.params;
  try {
    const files = await File.find({ owner: id });
    res.status(200).json(files);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
// Get User File
export const getUserFile = async (req, res) => {
  const { id } = req.params;
  try {
    const file = await File.findById(id);
    res.status(200).json(file);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
