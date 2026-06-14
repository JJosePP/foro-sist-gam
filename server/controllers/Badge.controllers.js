import badgeService from '../services/Badge.service.js'

// const getBadges = async (req,res,next) => {
//     try {
//         let page = Math.floor(req.query.page) || 1;
//         if(page < 1) {page = 1}
//         let result = await badgeService.getBadges(page);

//         return res.status(200).json({result})
//     } catch (error) {
//         next(error)
//     }
// }

// const createBadge = async (req,res,next) => {
//     try {
//         await badgeService.createBadge(req.body, req.files[0]);

//         return res.status(200).json({msg: "Emblema creado correctamente"});
//     } catch (error) {
//         next(error);
//     }
// }

// const editBadge = async (req,res,next) => {
//     try {
//         const badgeId = req.params.badgeId;

//         let badge = await badgeService.editBadge(badgeId, req.body, req.files[0]);

//         return res.status(200).json({msg: "Emblema editado con éxito", badge})
//     } catch (error) {
//         next(error);
//     }
// }

// const deleteBadge = async (req,res,next) =>{
//     try {
//         await badgeService.deleteBadge(req.params.badgeId) 
//         return res.status(200).json({msg: "Emblema eliminado con éxito"})
//     } catch (error) {
//         next(error)
//     }
// }
export default {
    // getBadges,
    // createBadge,
    // editBadge,
    // deleteBadge
}