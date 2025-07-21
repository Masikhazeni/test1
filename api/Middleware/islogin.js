// import jwt from "jsonwebtoken";

// export const isLogin = (req, res,next) => {
//   try {
//     const { userId} = jwt.verify(
//       req?.headers?.authorization.split(" ")[1],
//       process.env.SECRET_JWT
//     );
//     req.userId = userId;
//     return next();
//   } catch (error) {
//     return res.status(401).json({
//       message: "ابتدا وارد شوید",
//       success: false,
//     });
//   }
// };
export const isLogin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new Error("No auth header");

    const token = authHeader.split(" ")[1];
    if (!token) throw new Error("No token");

    const { userId } = jwt.verify(token, process.env.SECRET_JWT);
    req.userId = userId;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "ابتدا وارد شوید",
      success: false,
    });
  }
};

