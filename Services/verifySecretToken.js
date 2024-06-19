import jwt from 'jsonwebtoken'
import 'dotenv/config'


function verifySecretToken(token) {
    return jwt.verify( token , process.env.SECRET_KEY);
}

export default verifySecretToken