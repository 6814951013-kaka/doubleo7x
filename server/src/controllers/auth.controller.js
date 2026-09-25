const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const createToken = (user) =>
  jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const responseFor = (user) => ({
  token: createToken(user),
  user: { id: user._id, name: user.name, email: user.email },
});

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (typeof name !== "string" || !name.trim() || typeof email !== "string" || !email.trim() || typeof password !== "string" || !password) {
      return res.status(400).json({ message: "กรุณากรอกชื่อ อีเมล และรหัสผ่านให้ครบ" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail) || normalizedEmail.length > 254) {
      return res.status(400).json({ message: "กรุณากรอกอีเมลให้ถูกต้อง" });
    }
    if (name.trim().length > 80) {
      return res.status(400).json({ message: "ชื่อต้องไม่เกิน 80 ตัวอักษร" });
    }
    // Check signing configuration before creating an account that cannot sign in.
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured");
    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({ message: "อีเมลนี้สมัครสมาชิกแล้ว กรุณาเข้าสู่ระบบ" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email: normalizedEmail, password: hashedPassword });
    res.status(201).json(responseFor(user));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "อีเมลนี้สมัครสมาชิกแล้ว กรุณาเข้าสู่ระบบ" });
    }
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== "string" || !email.trim() || typeof password !== "string" || !password) {
      return res.status(400).json({ message: "กรุณากรอกอีเมลและรหัสผ่าน" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }
    res.json(responseFor(user));
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res) => {
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email } });
};

module.exports = { register, login, getCurrentUser };
