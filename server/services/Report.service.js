import postModel from "../models/Post.model.js";
import reportModel from "../models/Report.model.js";
import { apiErrors } from "../utils/apiErrors.js";

const createReport = async (postId, userId, reason, urlToPost) => {
    let postExist = await postModel.findById({_id: postId});
    if(!postExist) {
        throw apiErrors.postNotFound;
    }
    if(postExist.isModerated){
        throw apiErrors.alreadyModerated
    }
    let report = new reportModel({
        reason: reason,
        post: postId, 
        user: userId,
        urlToPost: urlToPost
    });

    return await report.save();
}

const deleteReport = async (reportId) => {
    let report = await reportModel.findByIdAndDelete({_id: reportId});
    if(!report) {
        throw apiErrors.reportNotFound;
    }
}
//obtener todos los reportes
const getReports = async (page) => {
    const resultsPerPage = 10;
    let hasNextPage = false;

    const fieldsToSelectForPost = "-rating -status -numReplies -negativeVotesList -positiveVotesList -positiveVotes -negativeVotes -isModerated -createdAt -updatedAt";
    const fieldsToSelectForUser = "_id userName profilePic.secure_url"
    let [result, totalReports] = await Promise.all([
        reportModel.find()
            // .populate({path: "post", select: fieldsToSelectForPost, populate: {path: "user", select: fieldsToSelectForUser}})
            .populate({path: "user", select: fieldsToSelectForUser})
            .populate({path: "post", select: "kind"})
            .sort({createdAt: 1})
            .skip((page - 1) * resultsPerPage)
            .limit(resultsPerPage + 1),
        reportModel.countDocuments()
    ])
    console.log("LISTA REPORTS: ", result)
    for(let report of result) {
        if(report.post.kind === "Reply"){
            // await report.populate({path: "post", select: fieldsToSelectForPost, populate: {path: "thread", select: "_id title content"}})
            await report.populate({path: "post", select:fieldsToSelectForPost, populate: {path: "thread", select: "_id title content"}, populate: {path: "user", select: fieldsToSelectForUser}})
        }else if(report.post.kind === "Thread"){
            await report.populate({path: "post", select:fieldsToSelectForPost, populate: {path: "category", select: "_id name"}, populate: {path: "user", select: fieldsToSelectForUser}})
        }else if(report.post.kind === "Review"){
            await report.populate({path: "post", select:fieldsToSelectForPost, populate: {path: "game", select: "_id name"}, populate: {path: "user", select: fieldsToSelectForUser}})
        }
    }
    if(result.length > resultsPerPage){
        hasNextPage = true;
        result.pop()
    }

    return {
        data: result,
        currentPage: page,
        hasNextPage,
        totalPages: Math.ceil(totalReports/resultsPerPage),
        totalReports
    }
}
//obtener datos un reporte ESTE CREO QUE NO
export default {
    createReport,
    deleteReport,
    getReports
}