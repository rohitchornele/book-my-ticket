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

    await sendVerificationEmail(user, verificationUrl);

    const userObj = { ...user };
    delete userObj.password;
    delete userObj.verificationToken;

    return userObj;
}


const loginService = async ({ email, password }) => {

    const userArray = await db.select().from(userTable).where(eq(userTable.email, email));

    if (!userArray.length) {
        throw ApiError.badRequest("Invalid credentials")
    }

    const user = userArray[0];

    const salt = user.salt
    const hash = createHmac('sha256', salt).update(password).digest('hex');

    if (user.password !== hash) {
        throw ApiError.badRequest("Invalid credentials")
    }

    if (!user.emailVerified) {
        throw ApiError.forbidden("Please verify your email, before login")
    }

    const refreshToken = generateRefreshToken({ id: user.id })
    const accessToken = generateAccessToken({ id: user.id, role: user.role })

    const hashedRefreshToken = hashToken(refreshToken);

    await db.update(userTable).set({ refreshToken: hashedRefreshToken })
        .where(eq(userTable.id, user.id));

    const userObj = { ...user };
    delete userObj.password;
    delete userObj.verificationToken;
    delete userObj.refreshToken;

    return { user: userObj, accessToken, refreshToken };
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
    // const userArray = await db.select().from(userTable).where(eq(userTable.id, userId));
    // if (!userArray.length) {
    //     throw ApiError.badRequest("User not found")
    // }

    // const user = userArray[0];

    await db.update(userTable).set({ refreshToken: null }).where(eq(userTable.id, userId));
}

const verifyEmailService = async (token) => {

    const hashedToken = hashToken(token)


    // console.log("Token from URL : ", token);
    // console.log("Hashed Token : ", hashedToken);

    // search using hashed token 
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
}




export { registerServices, loginService, refreshService, logoutService, verifyEmailService }