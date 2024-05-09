import express from  "express";

const router = express.Router();

router.get("/", (req,res)=>{
    res.send("hi this is games")
})

router.get("/2",(req,res)=>{
    res.send("hi this is games 2")
})

export default router;