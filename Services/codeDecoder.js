import { jwtDecode } from "jwt-decode";

function CodeDecoder (token) {
    
    var decoded = jwtDecode(token);;

    return decoded;
}

export default CodeDecoder