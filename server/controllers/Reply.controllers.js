import mongoose from "mongoose";
import replyService from "../services/Reply.service.js";

const createReply = async (req,res,next) => {
    try {
        let content = req.body.content
        const reply = await replyService.createReply(req.params.threadId, content, req.uid)

        return res.status(201).json({reply})

    } catch (error) {
        next(error)
    }
}

const getRepliesByThread = async (req,res,next) => {
    try {
        let page = Math.floor(req.query.page) || 1;
        if(page < 1) {page = 1};

        let replies = await replyService.getRepliesByThread(req.params.threadId, page)
        
        const isMod = req.roles?.includes("moderator")

        const result = replies.data.map(reply => {
            const r = reply.toObject()

            if(r.isModerated && !isMod){
                r.content = null
            }

            return r;
        })
        return res.status(200).json({result, 
                currentPage:replies.currentPage,
                hasNextPage:replies.hasNextPage,
                totalPages:replies.totalPages,
                totalReplies:replies.totalReplies})
    } catch (error) {
        next(error)
    }
}

const editReply = async (req,res,next) => {
    try {
        const replyId = req.params.replyId
        const content = req.body.content

        let result = await replyService.editReply(replyId, content, req.uid)

        return res.status(200).json(result)
    } catch (error) {
        next(error)
    }
}

export default {
    createReply,
    getRepliesByThread,
    editReply
}