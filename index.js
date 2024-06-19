import express from 'express';
import cors from 'cors';
import mongoose from './DB/index.js';
import router from './Routes/index.js';

const app = express()
const PORT = process.env.PORT || 9000

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error"));
db.once("open", function(){
    console.log("DB Connected");
})

app.use(express.json());
app.use(cors());
app.use('/', router)

app.listen(PORT, ()=>{
    console.log(`Server is running on Port ${PORT}`);
});
