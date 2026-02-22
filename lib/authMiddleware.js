import jwt from "jsonwebtoken";

export function verifyToken(req) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { error: "No token provided" };
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return { user: decoded };
  } catch (error) {
    return { error: "Invalid or expired token" };
  }
}
