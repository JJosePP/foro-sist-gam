import gameModel from "../models/Game.model.js";
import reviewModel from "../models/Review.model.js";
import { apiErrors } from "../utils/apiErrors.js";

const createReview = async (data) => {
    let existingGame = await gameModel.findById({_id: data.game});
    if(!existingGame){
        throw apiErrors.gameNotFound;
    }

    let existingReview = await reviewModel.findOne({
        $and: [
            {game: data.game},
            {user: data.user}
        ]
    })

    if(existingReview){
        let createDate = existingReview.createdAt.toLocaleString(undefined,{year:"numeric",month:"long", day:"numeric"})
        let updateDate = existingReview.updatedAt.toLocaleString(undefined,{year:"numeric",month:"long", day:"numeric"})
        let reviewError = {...apiErrors.existingReview}
        reviewError.details = reviewError.details.concat(" el ", createDate," (Actualizada el ", updateDate, ")")
        throw reviewError  
    }
    let review = await reviewModel.create(data);

    await existingGame.updateOne({
        $inc: {
            "rating.overall": data.rating.overall,
            "rating.story": data.rating.story,
            "rating.gameplay": data.rating.gameplay,
            "rating.technicalSection": data.rating.technicalSection,
            "rating.art": data.rating.art,
            "rating.sound": data.rating.sound,
            numReviews: 1
        }
    })

    return review;
}

const getReviewsByGames = async (gameId, resultsPerPage, page, sort) => {
    let hasNextPage = false;
    let game = await gameModel.exists({_id: gameId});
    
    if(!game){
        throw apiErrors.gameNotFound;
    }

    let [result, totalReviews] = await Promise.all([
        reviewModel.find({game: gameId})
            .populate({path: "user", select: "id userName profilePic.secure_url"})
            .sort(sort)
            .skip((page - 1) * resultsPerPage)
            .limit(resultsPerPage + 1),
        reviewModel.countDocuments({game: gameId})
    ])

    if(result.length > resultsPerPage){
        hasNextPage = true;
        result.pop()
    }

    return {
        data: result,
        currentPage: page,
        hasNextPage,
        totalPages: Math.ceil(totalReviews/resultsPerPage),
        totalReviews
    }
}

const getReview = async (reviewId) => {
    let review = await reviewModel.findById(reviewId)
        .populate({path: "user", select: "id userName profilePic.secure_url"})
        .populate({path:"game", select: "id name mainImage.secure_url "});
    if(!review){
        throw apiErrors.reviewNotFound;
    }

    return review;
}

const editReview = async (reviewId, data) => {
    let review = await reviewModel.findById(reviewId);
    if(!review){
        throw apiErrors.reviewNotFound;
    }

    if(review.user.toString() !== data.user || review.isModerated){
        throw apiErrors.unauthorized;
    }
    let oldRating = {...review.rating}

    review.content = data.content;
    review.rating = data.rating;
    await review.save()

    await gameModel.updateOne(
        {_id: review.game},
        {$inc: {
            "rating.overall": data.rating.overall - oldRating.overall,
            "rating.story": data.rating.story - oldRating.story,
            "rating.gameplay": data.rating.gameplay - oldRating.gameplay,
            "rating.technicalSection": data.rating.technicalSection - oldRating.technicalSection,
            "rating.art": data.rating.art - oldRating.art,
            "rating.sound": data.rating.sound - oldRating.sound,
        }
    })
    return review;

}

const deleteReview = async(reviewId, uid) => {
    let review = await reviewModel.findById(reviewId);
    if(!review){
        throw apiErrors.reviewNotFound
    }
    if(review.user.toString() !== uid || review.isModerated){
        throw apiErrors.unauthorized;
    }
    await review.deleteOne()
    await gameModel.updateOne(
        {_id: review.game},
        {$inc: {
            "rating.overall": -review.rating.overall,
            "rating.story": -review.rating.story,
            "rating.gameplay": -review.rating.gameplay,
            "rating.technicalSection": -review.rating.technicalSection,
            "rating.art": -review.rating.art,
            "rating.sound": -review.rating.sound,
            numReviews: -1
        }
    })
}

export default {
    createReview,
    getReviewsByGames,
    getReview,
    editReview,
    deleteReview
}