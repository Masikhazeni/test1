import User from "../Models/userMd";
class UserController {
  static async createUser({ req, res }) {
    try {
        
    } catch (error) {
      console.error("خطا در ساختن کاربر", error);
      res.status(500).json(
        { success: false,
            message:'خطای داخلی سرور'
       }
    );
    }
  }
}
