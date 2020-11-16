import jwt from "jsonwebtoken";
import User from "../models/User";
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

export default async (req, res, next) => {
  const token = req.header("x-auth-token");

  // Check for token
  if (!token)
    return res.status(401).json({ msg: "No token, authorizaton denied" });

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Add user from payload
    req.user = await User.findById(decoded.id);
    next();
  } catch (e) {
    res.status(400).json({ msg: e.msg });
  }
};
