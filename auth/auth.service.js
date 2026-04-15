import { eq, gt } from "drizzle-orm"
import ApiError from "../common/config/utils/api-error.js"
import ApiResponse from "../common/config/utils/api-response.js"
import { generateAccessToken, generateRefreshToken, generateResetToken, verifyRefreshToken } from "../common/config/utils/jwt.utils.js"
import { db } from "../db/index.js"
import { userTable } from "../db/schema.js"
import { createHmac, randomBytes, createHash } from 'node:crypto'
import { sendVerificationEmail } from "../common/config/utils/emailService.js"


const hashToken = (token) => {
    return createHash('sha256').update(token).digest('hex');
}


const registerServices = async ({ firstName, lastName, email, password, role }) => {

    try {
        const existingUser = await db.select().from(userTable).where(eq(userTable.email, email))

        // console.log("ExistingUser : ", existingUser)


        if (existingUser.length > 0) throw ApiError.conflict("user email already exist")

        const salt = randomBytes(32).toString('hex');
        const hash = createHmac('sha256', salt).update(password).digest('hex');

        const { rawToken, hashedToken } = generateResetToken();

        const insertedUser = await db.insert(userTable).values({
            firstName,
            lastName,
            email,
            password: hash,
            role,
            salt,
            verificationToken: hashedToken
        }).returning()

        const user = insertedUser[0];

        // console.log("inserted user = ", user)

        // const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${rawToken}`
        const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-email/${rawToken}`
        // console.log("reister user = ", user)

        // try {
        //     await sendVerificationEmail(user, verificationUrl);
        // } catch (err) {
        //     console.log("Email failed:", err.message);
        // }

        const userObj = { ...user };
        delete userObj.password;
        delete userObj.verificationToken;

        return userObj;
    } catch (error) {
        console.error("Error while user registration : ", error)
    }
}


const loginService = async ({ email, password }) => {

    try {
        const userArray = await db.select().from(userTable).where(eq(userTable.email, email));

        if (!userArray.length) {
            throw ApiError.badRequest("Invalid credentials")
        }

        const user = userArray[0];

        const salt = user.salt
        const hash = createHmac('sha256', salt).update(password).digest('hex');

        if (user?.password !== hash) {
            throw ApiError.badRequest("Invalid credentials")
        }

        // if (!user.emailVerified) {
        //     throw ApiError.forbidden("Please verify your email, before login")
        // }

        const refreshToken = generateRefreshToken({ id: user.id })
        const accessToken = generateAccessToken({ id: user.id, role: user.role })

        const hashedRefreshToken = hashToken(refreshToken);

        const updatingUSer = await db.update(userTable).set({ refreshToken: hashedRefreshToken })
            .where(eq(userTable.id, user.id)).returning();

        const userObj = updatingUSer[0];
        delete userObj.password;
        delete userObj.verificationToken;
        delete userObj.refreshToken;

        return { user: userObj, accessToken, refreshToken };
    } catch (error) {
        console.error("Error while login : ", error)
    }
}

const refreshService = async (token) => {
    if (!token) throw ApiError.unAuthorized("Refresh Token Missing");
    const decoded = verifyRefreshToken(token);

    const userArray = await db.select().from(userTable).where(eq(userTable.id, decoded.id));
    if (!userArray.length) {
        throw ApiError.badRequest("User not found")
    }

    const user = userArray[0]

    if (user.refreshToken !== hashToken(token)) {
        throw ApiError.unAuthorized("Invalid refresh token")
    }

    const accessToken = generateAccessToken({ id: user.id, role: user.role });

    return { accessToken }
}


const logoutService = async (userId) => {

    try {
        await db.update(userTable).set({ refreshToken: null }).where(eq(userTable.id, userId));

    } catch (error) {
        console.error("Error in logout ", error)
    }

}

const verifyEmailService = async (token) => {

    try {
        const hashedToken = hashToken(token)

        const userArray = await db.select().from(userTable).where(eq(userTable.verificationToken, hashedToken));

        const user = userArray[0];

        // console.log("Verifying user : ", user)

        if (!user) {
            throw ApiError.badRequest("user not available")
        }

        // clear token and verify user 
        user.emailVerified = true;
        user.verificationToken = null;

        await db.update(userTable).set({
            emailVerified: true,
            verificationToken: null,
        }).where(eq(userTable.id, user.id));

        return user
    } catch (error) {
        console.error("Email not verified : ", error)
    }


}




export { registerServices, loginService, refreshService, logoutService, verifyEmailService }