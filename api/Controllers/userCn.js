import User from "../Models/userMd.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

class UserController {
  static async createUser(req, res) {
    try {
      const { phoneNumber, email, password } = req.body;
      const existingByPhone = await User.findByPhoneNumber(phoneNumber);
      const existingByEmail = await User.findByEmail(email);

      if (existingByPhone || existingByEmail) {
        return res.status(400).json({
          error: "کاربر با این شماره تلفن یا ایمیل قبلا وارد شده است",
        });
      }
      const passReg = new RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/);
      if (!passReg.test(password)) {
        return res
          .status(400)
          .json({ success: false, message: "رمز عبور مناسب نیست" });
      }
      const hashPassword = bcryptjs.hashSync(password, 10);

      const userId = await User.create({
        phoneNumber,
        email,
        password: hashPassword,
      });
      const token = jwt.sign({ userId }, process.env.SECRET_JWT);
      const user = await User.findById(userId);

      res.status(201).json({
        message: "User created successfully",
        data: user,
        token,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getUser(req, res) {
    try {
      const auth = req.headers?.authorization;
      if (!auth) {
        return res.status(401).json({
          success: false,
          message: "توکن وجود ندارد",
        });
      }

      const token = auth.split(" ")[1];
      const { userId } = jwt.verify(token, process.env.SECRET_JWT);

      const { id } = req.params;

      if (id != userId) {
        return res.status(403).json({
          success: false,
          message: "شما مجوز دسترسی ندارید",
        });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: "کاربر یافت نشد" });
      }

      return res.status(200).json({
        success: true,
        data: {
          phoneNumber: user.phoneNumber,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "خطای سرور" });
    }
  }
}

export default UserController;
