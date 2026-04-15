import ApiError from "../common/config/utils/api-error.js";
import ApiResponse from "../common/config/utils/api-response.js";
import { loginService, logoutService, registerServices, verifyEmailService } from "./auth.service.js"


const register = async (req, res) => {
    try {
        const user = await registerServices(req.body);
        return ApiResponse.created(res, "Registration successful", user);
    } catch (error) {
        console.error("Error in sign up : ", error)
    }
};

const login = async (req, res) => {
    try {
        console.log("req body : ", req.body)
        const email = req.body.email;
        const password = req.body.password;

        const result = await loginService(email, password);
        
        if(!result) {
            throw ApiError.badRequest("No data found in request body")
        }

        const { user, accessToken, refreshToken } = result;

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true, // true in production
            sameSite: "none",
            path: '/',
            maxAge: 15 * 60 * 1000,
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true, // true in production
            sameSite: "none",
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // console.log("Setting cookies:", accessToken, refreshToken);

        return ApiResponse.ok(res, "Successfully Logged In", user);

    } catch (error) {
        console.error("Error while login : ", error)
    }
};


export const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.params;

        const user = await verifyEmailService(token);

        if (!user.emailVerified) {
            return res.redirect("/login.html?verified=false");
        }
        return res.redirect("/login.html?verified=true");

    } catch (error) {
        return res.redirect("/login.html?verified=false");
    }
};

const getMe = (req, res) => {
    // const user = req.user
    // return ApiResponse.ok(res, "User Data Fetched Successfully", user)
    return res.json({ user: req.user });
};

const logout = async (req, res) => {
    const userId = req.user.id
    // console.log("logout user = ", userId)

    await logoutService();

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return ApiResponse.ok(res, "User Logout Successfully", true)
}


export { register, login, getMe, logout }