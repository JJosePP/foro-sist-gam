import postService from "../services/Post.service.js";

const votePost = async (req,res,next) => {
    try {
        const postId = req.params.postId;
        const vote = req.params.vote;
        const uid = req.uid;

        await postService.votePost(postId,uid,vote);

        return res.status(200).json({msg: "Voto guardado correctamente"})
    } catch (error) {
        next(error)
    }
}

const moderatePost = async (req,res,next) => {
    try {
        const postId = req.params.postId;
        const uid = req.uid;
        const reason = req.body.reason;
        await postService.moderatePost(postId, uid, reason)
        return res.status(200).json({msg: "Publición moderada con éxito"})
    } catch (error) {
        next(error)
    }
}

const numPostByUserAndLatestPost = async (req,res,next) => {
    try {
        let user = req.query.user;
        console.log(user)
        let result = await postService.numPostByUserAndLatestPost(user);

        return res.status(200).json({result})
    } catch (error) {
        next(error)
    }
}

export default {
    votePost,
    moderatePost,
    numPostByUserAndLatestPost
}