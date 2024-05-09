import express from "express";
import routes from "./routes/index.js";
import connectDB from "./config/db.js";
import morgan from "morgan";
import quizModel from "./models/Quiz.model.js"
import userModel from './models/User.model.js'
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors"

const app = express();
const PORT = process.env.PORT
// lista de dominios que pueden acceder a la api
const whiteList = [process.env.ORIGIN1]
// middlewares
app.use(cors({
    origin: function(origin, callback){
        if(!origin || whiteList.includes(origin)){
            return callback(null, origin)
        }
        return callback("Error de CORS origin: " + origin + " No autorizado!")
    },
    credentials: true,
}));
app.use(morgan('dev'))
app.use(express.urlencoded({extended:false}))
app.use(express.json())
app.use(cookieParser())

await connectDB();

app.get('/', (req,res) =>{
    res.send('Hello world')
})

// routes
app.use("/api/v1",routes.Authentication)
app.use("/api/v1/games",routes.Games)

app.get('/badge',async (req,res)=>{
    const userSchema = new mongoose.Schema({
        name: String,
        friends: [{ type: mongoose.Types.ObjectId, ref: 'Usuario' }]
    });

    const usuario = mongoose.model("Usuario", userSchema)
    // const id1 = new mongoose.Types.ObjectId()
    // const id2 = new mongoose.Types.ObjectId()
    // const id3 = new mongoose.Types.ObjectId()
    // const id4 = new mongoose.Types.ObjectId()
    // const id5 = new mongoose.Types.ObjectId()
    // const u1 = new usuario({
    //     _id: id1,
    //     name: 'Val',
    //     friends: [id2,id3]
    // })
    // const u2 = new usuario({
    //     _id: id2,
    //     name: 'Pedro',
    //     friends: [id1,id4]
    // })
    // const u3 = new usuario({
    //     _id: id3,
    //     name: 'Maria',
    //     friends: [id1,id5]
    // })
    // const u4 = new usuario({
    //     _id: id4,
    //     name: 'Francisco',
    //     friends: [id2,id5]
    // })
    // const u5 = new usuario({
    //     _id: id5,
    //     name: 'Ana',
    //     friends: [id3,id4]
    // })
    // await u1.save();
    // await u2.save();
    // await u3.save();
    // await u4.save();
    // await u5.save();

    const quiz = await quizModel.findById('660bf6b02af24352a95d3e37')
    const a = await quiz.populate({path: 'badge', populate:{path: 'users'}})
    console.log(quiz.badge)

    const user1 = await userModel.findById('660bf6002af24352a95d3e36')
    // await user1.populate('badges')
    console.log(user1)
    // console.log(a)
    // const a = await quiz.populate({path: 'badge', populate:{path: 'users'}})
    // console.log(a)

    // const val = await usuario.findOne({ name: 'Val' })
    // await val.populate({path: 'friends', populate: { path: 'friends' }});
    // console.log(val.friends[0])
    res.send('hola')
})

app.listen(PORT, ()=>{
    console.log(`Example app listening on port ${PORT}`)
})