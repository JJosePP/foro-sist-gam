import request from 'supertest'
import app from "../app.js"
import {beforeAll, test, afterAll, expect} from '@jest/globals'
import { generateToken } from '../utils/tokenManager.js';
import userModel from "../models/User.model.js";
import mongoose from 'mongoose';
import reviewModel from '../models/Review.model.js'
import { accessSync } from 'fs-extra';
import reportModel from '../models/Report.model.js'
import threadModel from '../models/Thread.model.js'
import replyModel from '../models/Reply.model.js'


let admin;
let token;
let post;
let post2;
let post3;
let unexistingPostId = new mongoose.Types.ObjectId;

beforeAll(async () => {
    await userModel.deleteMany({})
    await reviewModel.deleteMany({})
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

    post2 = await reviewModel.create({
        content: 'Este es un juego muy inmersivo, parece que estás en la ciudad rodeado de zombies',
        rating: {
            overall: 89,
            story: 95,
            gameplay: 89,
            technicalSection: 88,
            art: 96,
            sound: 93
        },
        game: new mongoose.Types.ObjectId,
        user: admin._id
    })

    post3 = await replyModel.create({
        content: 'Muy buen aporte amigo, ya tengo ganas de leer otra de tus guías',
        user: admin._id,
        thread: new mongoose.Types.ObjectId
    })
    let res = generateToken(admin._id, admin.roles)
    token = res.token
})

test('should fail because the post doesn´t exist', async () => {
    await request(app).put(`/api/v1/posts/${unexistingPostId}/vote/1`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
})

test('should positively vote a post', async () => {
    await request(app).put(`/api/v1/posts/${post._id}/vote/1`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
})

test('should change the vote to a negative point', async () => {
    await request(app).put(`/api/v1/posts/${post._id}/vote/-1`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
})

test('should negatively vote a post', async () => {
    await request(app).put(`/api/v1/posts/${post2._id}/vote/-1`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
})

test('should change the vote to a positive point', async () => {
    await request(app).put(`/api/v1/posts/${post2._id}/vote/1`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
})

test('should fail moderating because the post doesn´t exist', async() => {
    await request(app).put(`/api/v1/posts/${unexistingPostId}/moderate`)
        .set('Authorization', `Bearer ${token}`)
        .send({
            reason: 'Ofensivo'
        })
        .expect(404)
})

test('should moderate a post', async() => {
    await request(app).put(`/api/v1/posts/${post._id}/moderate`)
        .set('Authorization', `Bearer ${token}`)
        .send({
            reason: 'Ofensivo'
        })
        .expect(200)
})

test('should get number of posts and the latest posts of a user', async() => {
    await request(app).get(`/api/v1/posts/?user=${admin._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
})


afterAll(async () => {
    await mongoose.connection.close();
});