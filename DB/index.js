import mongoose from "mongoose";
import 'dotenv/config'

mongoose.connect(process.env.URL_Mobile);

export default mongoose;