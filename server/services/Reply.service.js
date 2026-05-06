import replyModel from "../models/Reply.model.js";
import threadModel from "../models/Thread.model.js";
import { apiErrors } from "../utils/apiErrors.js";

const createReply = async (threadId, content, userId) => {
    let thread = await threadModel.findById(threadId);
    
    if(!thread){
        throw apiErrors.threadNotFound
    }
    if(thread.status === "Cerrado"){
        throw apiErrors.closedThread
    }

    let reply = new replyModel({
        content: content,
        user: userId,
        thread: threadId
    })

    await reply.validate();

    return await reply.save();
}

const getRepliesByThread = async (threadId, page) => {
    const resultsPerPage = 30
    let hasNextPage = false;
    let thread = await threadModel.findById(threadId);

    if(!thread){
        throw apiErrors.threadNotFound
    }    
    let [result, totalReplies] = await Promise.all([
        replyModel.find({thread: threadId})
            .populate({path: "user", select: "id userName profilePic.secure_url"})
            .sort({createdAt: 1})
            .skip((page - 1) * resultsPerPage)
            .limit(resultsPerPage + 1),
        replyModel.countDocuments({thread: threadId})
    ])

    if(result.length > resultsPerPage){
        hasNextPage = true;
        result.pop()
    }

    return {
        data: result,
        currentPage: page,
        hasNextPage,
        totalPages: Math.ceil(totalReplies/resultsPerPage),
        totalReplies
    }

}

const editReply = async (replyId, content, uid) => {
    let reply = await replyModel.findById(replyId);

    if(!reply){
        apiErrors.replyNotFound;
    }
    
    if(reply.user.toString() !== uid){
        apiErrors.unauthorized;
    }

    if(reply.isModerated){
        apiErrors.moderatedContent;
    }

    reply.content = content;
    await reply.validate();
    return await reply.save();
}

export default {
    createReply,
    getRepliesByThread,
    editReply
}