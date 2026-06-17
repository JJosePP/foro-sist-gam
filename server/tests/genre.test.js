import request from 'supertest'
import app from "../app.js"
import {beforeAll, test, afterAll} from '@jest/globals'
import { generateToken } from '../utils/tokenManager.js';
import userModel from "../models/User.model.js";
import genreModel from '../models/Genre.model.js'
import mongoose from 'mongoose';


let admin;
let token;
let genreToDelete;
let unexistingGenreId = new mongoose.Types.ObjectId
beforeAll(async () => {
    await userModel.deleteMany({})
    await genreModel.deleteMany({})

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

    let res = generateToken(admin._id, admin.roles)
    token = res.token
})

test('should get all genres', async () => {
    await request(app).get('/api/v1/genres')
        .expect(200)
})

test('should create a genre', async () => {
    const response = await request(app).post('/api/v1/genres')
        .set('Authorization', `Bearer ${token}`)
        .send({
            name: 'roguelike'
        })
        .expect(200);

    genreToDelete = response.body.createdGenre
})

test('should fail because there is a genre with the same name', async () => {
    await request(app).post('/api/v1/genres')
        .set('Authorization', `Bearer ${token}`)
        .send({
            name: 'roguelike'
        })
        .expect(400);
})

test('shouldn´t delete because the genre doesn´t exist', async () => {
    await request(app).delete(`/api/v1/genres/${unexistingGenreId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
})

test('should delete a genre', async () => {
    await request(app).delete(`/api/v1/genres/${genreToDelete._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
})

afterAll(async () => {
    await mongoose.connection.close();
});