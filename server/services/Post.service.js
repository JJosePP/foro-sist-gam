import postModel from "../models/Post.model.js"
import { apiErrors } from "../utils/apiErrors.js";

const votePost = async (postId,uid,vote) => {
    let post = await postModel.findById(postId);
    if(!post){
        throw apiErrors.postNotFound
    }

    if(post.positiveVotesList.includes(uid)){
        if(vote==='-1'){
            let index = post.positiveVotesList.indexOf(uid);
            post.positiveVotesList.splice(index,1)
            post.positiveVotes--
            post.negativeVotesList.push(uid);
            post.negativeVotes++
            await post.save()
        }
    }else if(post.negativeVotesList.includes(uid)){
        if(vote==='1'){
            let index = post.negativeVotesList.indexOf(uid);
            post.negativeVotesList.splice(index,1);
            post.negativeVotes--;
            post.positiveVotesList.push(uid);
            post.positiveVotes++
            await post.save()
        }
    }else{
        if(vote==='1'){
            post.positiveVotes++;
            post.positiveVotesList.push(uid);
            await post.save()
        }
        if(vote==='-1'){
            post.negativeVotes++;
            post.negativeVotesList.push(uid);
            await post.save()
        }
    }
}

const moderatePost = async (postId, uid, reason) => {
    let post = await postModel.findById(postId);
    if(!post){
        throw apiErrors.postNotFound
    }

    post.moderatedBy = uid;
    post.moderationReason = reason;
    post.moderatedAt = Date.now();
    post.isModerated = true;

    await post.save()
}

const numPostByUserAndLatestPost = async (user) => {
    let [result, totalPosts] = await Promise.all([
        postModel.find({user: user})
            .sort({createdAt: -1})
            .limit(3)
            .select("-user -numReplies -negativeVotesList -positiveVotesList -content -positiveVotes -negativeVotes -isModerated -status -category -updatedAt -createdAt -rating"),
        postModel.countDocuments({user: user})
    ]);

    for (let post of result){
        if(post.kind === "Review"){
            await post.populate({path: "game", select: "_id name"})
        }else if(post.kind === "Reply"){
            await post.populate({path: "thread", select: "_id title"})
        }
    }

    return {
        recentPosts: result,
        totalPosts: totalPosts
    }
}

export default {
    votePost,
    moderatePost,
    numPostByUserAndLatestPost
}