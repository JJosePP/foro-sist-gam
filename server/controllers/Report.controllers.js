import reportService from "../services/Report.service.js"

const createReport = async (req, res, next) => {
    try {
        const report = await reportService.createReport(req.params.postId, req.uid, req.body.reason, req.body.urlToPost);
        return res.status(201).json({msg: "Reporte enviado con éxito"})
    } catch (error) {
        next(error)
    }
}

const deleteReport = async(req,res,next) => {
    try {
        await reportService.deleteReport(req.params.reportId)
        return res.status(200).json({message: "Reporte eliminado con éxito"})
    } catch (error) {
        next(error)
    }
}

const getReports = async (req,res,next) => {
    try {
        let page = Math.floor(req.query.page) || 1;
        if(page < 1) {page = 1};
        
        let result = await reportService.getReports(page);

        return res.status(200).json({result})

    } catch (error) {
        next(error)
    }
}

export default {
    createReport,
    deleteReport,
    getReports
}