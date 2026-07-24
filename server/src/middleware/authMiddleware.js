import jwt from "jsonwebtoken"
import dotenv from "dotenv";
dotenv.config()

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token not found" });
    }
    const token  = authHeader.split(" ")[ 1 ]
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) // verifying that if the token is real.
        req.user = decoded
        next()
    } catch (error) {
        return res.status(401).json({ message: "Token is invalid/expired" });
    }
}

export default authenticate;