import mongoose from "mongoose";
import threadService from "../services/Thread.service.js"

const createThread = async (req, res,next) => {
    try{
        const body = {
            title: req.body.title,
            content: req.body.content,
            category: req.body.category
        }

        const thread = await threadService.createThread(body, req.uid);

        return res.status(201).json({thread})

    }catch(error){
        next(error)
    }
}

const getThreads = async (req,res,next) => {
    try {
        let resultsPerPage = Math.floor(req.query.resultsPerPage) || 20
        let page = Math.floor(req.query.page) || 1
        let sortBy = req.query.sortBy
        let order = req.query.order
        let search = req.query.search
        let category = req.query.category

        if(sortBy){
            if(sortBy instanceof Array){
                sortBy = sortBy[0]
            }
            sortBy = sortBy.trim()
        }
        if(order){
            if(order instanceof Array){
                order = order[0]
            }
            order = order.trim()
        }
        const allowedSortFields = ['createdAt', 'positiveVotes', 'title'];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
        const sortOrder = order === 'desc' ? -1 : 1;

        const sort = {[sortField]: sortOrder, _id:1};

        if(resultsPerPage < 1) {resultsPerPage = 20}
        if(resultsPerPage > 50) {resultsPerPage = 50}

        if(page < 1) {page = 1}

        let result = await threadService.getThreads(category, resultsPerPage, page, sort, search);

        return res.status(200).json(result)
    } catch (error) {
        next(error)
    }
}

const editThread = async (req,res,next) => {
    try {
        const threadId = req.params.threadId

        const body = {
            title: req.body.title,
            content: req.body.content
        }
        let result = await threadService.editThread(threadId, req.uid, body);

        return res.status(200).json(result)
    } catch (error) {
        next(error)
    }
}

const getThread = async (req,res,next) => {
    try {
        const threadId = req.params.threadId;

        let thread = await threadService.getThread(threadId)

        const isMod = req.roles?.includes("moderator");
        const result = thread.toObject();
        
        if(result.isModerated && !isMod){
            result.content = null
        }

        return res.status(200).json({result})
    } catch (error) {
        next(error)
    }
}

const changeThreadStatus = async (req,res,next) => {
    try {
        const threadId = req.params.threadId;
        let status = req.body.status
        // const allowedStatus = ['Abierto', 'Cerrado']

        // if(status && !allowedStatus.includes(status)){
        //     return res.status(400).json({error: 'Estado no válido'})
        // }

        await threadService.changeThreadStatus(threadId, status)

        return res.status(200).json({message: `Hilo ${status.toLowerCase()} correctamente`})
    } catch (error) {
        // if(error.name === "CastError"){
        //     return res.status(400).json({error: `Inserte un ID de hilo válido (cadena hexadecimal de 24 caracteres)` })
        // }else if(error.name === "threadNotFound"){
        //     return res.status(error.status).json({error: error.message})
        // }else {
        //     return res.status(500).json({error: "Error interno del servidor"})
        // }
        next(error)
    }
}

const getNewestThreads = async (req,res,next) => {
    try {
        let result = await threadService.getNewestThreads();

        return res.status(200).json({result})
    } catch (error) {
        next(error)
    }
}
export default {
    createThread,
    getThreads,
    editThread,
    getThread,
    changeThreadStatus,
    getNewestThreads
}