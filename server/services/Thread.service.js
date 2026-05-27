import threadModel from "../models/Thread.model.js"
import categoryModel from "../models/Category.model.js"
import mongoose from "mongoose";
import { apiErrors } from "../utils/apiErrors.js";

const createThread = async (body, userId) => {
    const {title, category, content} = body
    
    let categoryExists = await categoryModel.exists({_id: category})
    
    if(!categoryExists){
        throw apiErrors.categoryNotFound
    }

    let thread = new threadModel({
        title: title,
        category: category,
        content: content,
        user: userId
    })
    await thread.validate();

    return await thread.save()
}
const createPipeline = (search, category) => {
    const pipeline = [
        {
            $search: {
                index: "threadsIndex",
                compound: {
                    must: [
                        {
                            autocomplete: {
                                query: search,
                                path: "title"
                            }
                        },
                        {
                            equals: {
                                path: "kind",
                                value: "Thread"
                            }
                        },
                        {
                            equals: {
                                path: "category",
                                value: category
                            }
                        }
                    ]
                }
            }
        }
    ]

    return pipeline
}

const getThreads = async (category, resultsPerPage, page, sort, search) => {
    let result;
    let totalItems;
    let hasNextPage = false;
    if(!category){
        throw apiErrors.missingCategoryQuery
    }
    if(search){
        const pipeline = createPipeline(search,new mongoose.Types.ObjectId(category))
        let searchPipeline = pipeline.slice()
        let countPipeline = pipeline.slice()

        searchPipeline.push(
            {
                $sort: sort
            },
            {
                $skip: (page - 1) * resultsPerPage
            },
            {
                $limit: resultsPerPage + 1
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            {
                $unwind: "$user"
            },
            {
                $unwind: "$category"
            },
            {
                $project: {
                    "user.name": 0,
                    "user.lastName":0,
                    "user.email":0,
                    "user.password": 0,
                    "user.profilePic.public_id":0,
                    "user.roles":0,
                    "user.authorized":0,
                    "user.badges": 0,
                    "user.createdAt": 0,
                    "user.updatedAt": 0,
                    "user.__v": 0,
                    "category.name": 0,
                    "category.createdAt": 0,
                    "category.updatedAt": 0,
                    "category.__v": 0,
                }
            }
        )
        result = await threadModel.aggregate(searchPipeline)
        countPipeline.push({$count: "total"})
        let total = await threadModel.aggregate(countPipeline)
        if(total.length === 0){
            totalItems = 0
        }else{
            totalItems = total[0].total
        }

    }else{
        [result, totalItems] = await Promise.all([
            threadModel.find({category: category})
                .populate({path: "user", select: "id userName profilePic.secure_url"})
                .populate({path: "category", select: "id name"})
                .sort(sort)
                .skip((page-1) * resultsPerPage)
                .limit(resultsPerPage + 1),
            threadModel.countDocuments({category:category})
        ])
        
    }

    if(result.length > resultsPerPage){
        hasNextPage = true
        result.pop()
    }

    return {
        data: result,
        currentpage: page,
        hasNextPage,
        totalPages: Math.ceil(totalItems/resultsPerPage),
        totalItems: totalItems
    }

}

const editThread = async(threadId, uid, body) => {
    let thread = await threadModel.findById(threadId);
    if(!thread){
        throw apiErrors.threadNotFound;
    }

    if(thread.user.toString() !== uid || thread.isModerated){
        throw apiErrors.unauthorized;
    }
    if(thread.status === "Cerrado"){
        throw apiErrors.closedThread
    }
    thread.title = body.title
    thread.content = body.content
    await thread.validate()
    let result = await thread.save()

    return result
}

const getThread = async(threadId) => {
    let thread = await threadModel.findById(threadId)
        .populate({path: "user", select: "id userName profilePic.secure_url"});
    
    if(!thread){
        throw apiErrors.threadNotFound
    }
    
    return thread
}

const changeThreadStatus = async (threadId, status) => {
    let thread = await threadModel.findById(threadId);
    if(!thread){
        throw apiErrors.threadNotFound;
    }
    thread.status = status
    await thread.validate()
    await thread.save()
}

const getNewestThreads = async () => {
    return await threadModel.find()
        .populate({path: "user", select: "id userName"})
        .sort({createdAt: -1, _id: 1})
        .limit(5)
        .select("id title user numReplies createdAt");
    
}
export default {
    createThread,
    getThreads,
    editThread,
    getThread,
    changeThreadStatus,
    getNewestThreads
}