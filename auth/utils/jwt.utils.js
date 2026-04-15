import JWT from 'jsonwebtoken'

// interface UserTokenPayload {
//     id: String
// }

const JWT_SECRET = process.env.JWT_SECRET

export const createUserToken = (payload) => {
    const token = JWT.sign(payload, JWT_SECRET)
    
    return token
}

export {generateResetToken}