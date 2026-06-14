import express from "express";
import connectDB from "./config/db.js";
import morgan from "morgan";
import quizModel from "./models/Quiz.model.js"
import userModel from './models/User.model.js'
import badgeModel from './models/Badge.model.js'
import invalidTokenModel from "./models/invalidTokens.model.js";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors"
import history from 'connect-history-api-fallback'
import path from 'path'
import { fileURLToPath } from 'url';
import { upload } from "./middlewares/multer.js";
import { uploadImage } from "./utils/cloudinary.js";
import gameRoutes from "./routes/Game.routes.js";
import authRoutes from "./routes/Authentication.routes.js"
import userRoutes from "./routes/User.routes.js"
import platformRoutes from './routes/Platform.routes.js'
import genreRoutes from './routes/Genre.routes.js'
import categoriesRoutes from './routes/Category.routes.js'
import threadRoutes from "./routes/Thread.routes.js"
import replyRoutes from "./routes/Reply.routes.js"
import tagRoutes from "./routes/Tag.routes.js"
import reviewRoutes from "./routes/Review.routes.js"
import { errorHandler } from "./middlewares/errorHandler.js";
import { cleanUpUploads } from "./middlewares/cleanUpUploads.js";
import questionRoutes from "./routes/Question.routes.js";
import badgeRoutes from './routes/Badge.routes.js';
import quizRoutes from './routes/Quiz.routes.js';
// import populateRoutes from './routes/RoutesToPopulate.js'
import postRoutes from './routes/Post.routes.js'
import reportRoutes from './routes/Report.routes.js'

const app = express();
const PORT = process.env.PORT
// lista de dominios que pueden acceder a la api
const whiteList = [process.env.ORIGIN1]
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

// middlewares
console.log(whiteList)
app.use(cors({
    origin: function(origin, callback){
        console.log("ORIGEN: ", origin)
        if(!origin || whiteList.includes(origin)){
            return callback(null, origin)
        }
        return callback("Error de CORS origin: " + origin + " No autorizado!")
    },
    credentials: true,
}));
app.use(morgan('dev'))
app.use(express.urlencoded({extended:false}))
app.use(express.json({
  limit: '50mb'
}));
app.use(cookieParser())

await connectDB();

// routes
app.use("/api/v1",authRoutes)
app.use('/api/v1/platforms', platformRoutes)
app.use('/api/v1/categories', categoriesRoutes)
app.use('/api/v1/genres', genreRoutes)
app.use("/api/v1/games",gameRoutes)
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/threads", threadRoutes)
app.use("/api/v1/replies", replyRoutes)
app.use('/api/v1/tags', tagRoutes)
app.use('/api/v1/reviews', reviewRoutes)
app.use('/api/v1/questions', questionRoutes)
// app.use('/api/v1/badges', badgeRoutes)
app.use('/api/v1/quizzes', quizRoutes)
app.use('/api/v1/posts', postRoutes)
app.use('/api/v1/reports', reportRoutes)
// app.use('/api/v1', populateRoutes)

app.use(cleanUpUploads)
app.use(errorHandler);

app.use(history());
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, ()=>{
    console.log(`Example app listening on port ${PORT}`)
})