import request from 'supertest'
import app from "../app.js"
import {beforeAll, test, afterAll} from '@jest/globals'
import { generateToken } from '../utils/tokenManager.js';
import mongoose from 'mongoose';
import userModel from "../models/User.model.js";
import reportModel from '../models/Report.model.js'
import reviewModel from '../models/Review.model.js'

let admin;
let token;
let report;
let unexistingPostId = new mongoose.Types.ObjectId
let post;
let moderatedPost;
beforeAll(async () => {
    await userModel.deleteMany({})
    await reportModel.deleteMany({})

    admin = await userModel.create({
        userName: 'pepito',
        normalizedUserName: 'pepito',
        name: 'Jose',
        lastName: 'Carrero',
        email: 'pepito@gmail.com',
        password: 'Pepit0s*',
        profilePic: {
            public_id: process.env.DEFAULT_PIC_ID,
            secure_url: process.env.DEFAULT_PIC_URL
        },
        description: 'Amante de los videojuegos en busca de persona con las que hablar',
        roles: ['user', 'moderator', 'administrator']
    })

    post = await reviewModel.create({
        content: 'La historia de este juego es brutal, te romperá el corazón pero te hará consciente del amor de un animal',
        rating: {
            overall: 89,
            story: 95,
            gameplay: 89,
            technicalSection: 88,
            art: 96,
            sound: 93
        },
        game: new mongoose.Types.ObjectId,
        user: new mongoose.Types.ObjectId
    })

    moderatedPost = await reviewModel.create({
        content: 'aiejdiejde ed',
        rating: {
            overall: 89,
            story: 95,
            gameplay: 89,
            technicalSection: 88,
            art: 96,
            sound: 93
        },
        game: new mongoose.Types.ObjectId,
        user: new mongoose.Types.ObjectId,
        isModerated: true,
        moderatedBy: new mongoose.Types.ObjectId,
        moderatedAt: Date.now(),
        moderationReason: 'Spam'
    })

    report = await reportModel.create({
        reason: 'Reporte de prueba',
        post: post._id,
        user: new mongoose.Types.ObjectId,
        urlToPost: '/threads/test'
    })

    let res = generateToken(admin._id, admin.roles)
    token = res.token
})

test('should get all reports', async () => {
    await request(app).get('/api/v1/reports')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
})

test('should fail deleting a report because it doesn´t exist', async () => {
    await request(app).delete(`/api/v1/reports/${unexistingPostId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
})

test('should delete a report', async () => {
    await request(app).delete(`/api/v1/reports/${report._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
})

test('should fail because the post doesn´t exist', async() => {
    await request(app).post(`/api/v1/posts/${unexistingPostId}/report`)
        .set('Authorization', `Bearer ${token}`)
        .send({
            reason: 'Creo que no es adecuado el lenguaje de este usuario',
            urlToPost: '/threads/test'
        })
        .expect(404)
})

test('should fail creating a report of a post because it is already moderated', async() => {
    await request(app).post(`/api/v1/posts/${moderatedPost._id}/report`)
        .set('Authorization', `Bearer ${token}`)
        .send({
            reason: 'Esto se considera spam',
            urlToPost: '/games/test'
        })
        .expect(400)
})

test('should create a report of a post', async() => {
    await request(app).post(`/api/v1/posts/${post._id}/report`)
        .set('Authorization', `Bearer ${token}`)
        .send({
            reason: 'Creo que no es adecuado el lenguaje de este usuario',
            urlToPost: '/threads/test'
        })
        .expect(201)
})

afterAll(async () => {
    await mongoose.connection.close();
});