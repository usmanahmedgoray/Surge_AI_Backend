import express from "express";
import * as dotenv from 'dotenv';
import cors from 'cors';

import connectDB from "./mongodb/connect.js";
import postRoutes from './routes/postRoutes.js';
import dalleRoutes from './routes/dalleRoutes.js'
dotenv.config();
const port = 8080;

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use('/api/v1/post',postRoutes)
app.use('/api/v1/dalle',dalleRoutes)

app.get('/', async (req, res) => {
    res.send('Hello')
})

const startServer = async () => {
    try {
        connectDB('mongodb+srv://usmanahmedgoray:Goraya61chak@cluster0.zghfzmw.mongodb.net/test?retryWrites=true&w=majority')
        
        app.listen(port, () => {
            console.log(`Server has started on port "http://localhost:${port}"`)
        })
    } catch (error) {
        console.log(error)
    }


}

startServer();

// Export the Express API
export default app