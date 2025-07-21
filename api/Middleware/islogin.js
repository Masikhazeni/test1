import jwt from "jsonwebtoken";

export const isLogin = (req, res,next) => {
  try {
    const { userId} = jwt.verify(
      req?.headers?.authorization.split(" ")[1],
      process.env.SECRET_JWT
    );
    req.userId = userId;
    return next();
  } catch (error) {
    return res.status(401).json({
      message: "ابتدا وارد شوید",
      success: false,
    });
  }
};
