import jwt from 'jsonwebtoken'
import 'dotenv/config'

function createSecretToken(id, email, username, isAdmin) {
    return jwt.sign({ 
        id, 
        email,
        username,
    }, process.env.SECRET_KEY);
};


export default createSecretToken