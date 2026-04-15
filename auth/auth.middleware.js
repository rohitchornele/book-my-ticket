import { db } from "../db/index.js";
import { userTable } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { verifyAccessToken } from "../common/config/utils/jwt.utils.js";

export const protect = async (req, res, next) => {

    let token;
    // Get token from cookie
    if (req.cookies && req.cookies.accessToken) {
        token = req.cookies.accessToken;
    }
    // Fallback to header
    else if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Access Denied, please login again",
        });
    }

    try {
        const decoded = verifyAccessToken(token);

        // console.log("DECODED:", decoded);

        if (!decoded || !decoded.id) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token",
            });
        }

        const [user] = await db
            .select()
            .from(userTable)
            .where(eq(userTable.id, decoded.id));

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User no longer exists",
            });
        }

        if (!user.emailVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email first",
            });
        }

        delete user.password;
        delete user.refreshToken;
        delete user.verificationToken;

        req.user = user;

        next();
    } catch (error) {
        console.log("Auth middleware Error:", error.message);

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Session expired, please login again",
            });
        }

        return res.status(401).json({
            success: false,
            message: "Invalid Token",
        });
    }
};