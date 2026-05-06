import reviewService from "../services/Review.service.js";

const createReview = async (req,res,next) => {
    try {
        const data = {
            content: req.body.content,
            rating: {
                overall: req.body.rating.overall,
                story: req.body.rating.story,
                gameplay: req.body.rating.gameplay,
                technicalSection: req.body.rating.technicalSection,
                art: req.body.rating.art,
                sound: req.body.rating.sound
            },
            game: req.params.gameId,
            user: req.uid
        }

        const review = await reviewService.createReview(data);

        return res.status(200).json({review});
    } catch (error) {
        next(error)
    }
}

const getReviewsByGames = async (req,res,next) => {
    try {
        let query = req.query
        let resultsPerPage = Math.floor(query.resultsPerPage) || 20;
        let page = Math.floor(query.page) || 1;
        let order = query.order
        const sortOrder = order === 'desc' ? -1 : 1;
        const sort = {createdAt: sortOrder};

        if(resultsPerPage < 1) {resultsPerPage = 20}
        if(resultsPerPage > 50) {resultsPerPage = 50}

        if(page < 1) {page = 1}

        let result = await reviewService.getReviewsByGames(req.params.gameId,resultsPerPage,page,sort);
        const isMod = req.roles?.includes("moderator");
        const reviews = result.data.map(review => {
            const r = review.toObject()

            if(r.isModerated && !isMod){
                r.content = null
            }

            return r;
        });
        return res.status(200).json({reviews, 
                currentPage:result.currentPage,
                hasNextPage:result.hasNextPage,
                totalPages:result.totalPages,
                totalReviews:result.totalReviews})
    } catch (error) {
        next(error)
    }
}

const getReview = async (req,res,next) => {
    try {
        const reviewId = req.params.reviewId;

        let review = await reviewService.getReview(reviewId);
        const isMod = req.roles?.includes("moderator");
        const result = review.toObject();

        if(result.isModerated && !isMod){
            result.content = null;
        }

        return res.status(200).json({result})
    } catch (error) {
        next(error)
    }
}

const editReview = async (req,res,next) => {
    try {
        const reviewId = req.params.reviewId;

        const data = {
            content: req.body.content,
            rating: {
                overall: req.body.rating.overall,
                story: req.body.rating.story,
                gameplay: req.body.rating.gameplay,
                technicalSection: req.body.rating.technicalSection,
                art: req.body.rating.art,
                sound: req.body.rating.sound
            },
            user: req.uid
        }
        const review = await reviewService.editReview(reviewId,data)

        return res.status(200).json({review})
    } catch (error) {
        next(error)
    }
}

const deleteReview = async (req,res,next) => {
    try {
        await reviewService.deleteReview(req.params.reviewId, req.uid);
        return res.status(200).json({message: "Reseña eliminada con éxito"})
    } catch (error) {
        next(error)
    }
}

export default {
    createReview,
    getReviewsByGames,
    getReview,
    editReview,
    deleteReview
}