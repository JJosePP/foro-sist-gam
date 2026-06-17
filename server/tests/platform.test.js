import request from 'supertest'
import app from "../app.js"
import {beforeAll, test, afterAll} from '@jest/globals'
import { generateToken } from '../utils/tokenManager.js';
import userModel from "../models/User.model.js";
import mongoose from 'mongoose';
import platformModel from '../models/Platform.model.js'

let admin;
let token;
let platformToDelete;
let unexistingPlatformId = new mongoose.Types.ObjectId

beforeAll(async () => {
    await userModel.deleteMany({})
    await platformModel.deleteMany({})

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

test('should get all platforms', async () => {
    await request(app).get('/api/v1/platforms')
        .expect(200)
})

test('should create a platform', async () => {
    const response = await request(app).post('/api/v1/platforms')
        .set('Authorization', `Bearer ${token}`)
        .send({
            name: 'pc'
        })
        .expect(200);

    platformToDelete = response.body.createdPlatform
})

test('should fail because there is a platform with the same name', async () => {
    await request(app).post('/api/v1/platforms')
        .set('Authorization', `Bearer ${token}`)
        .send({
            name: 'pc'
        })
        .expect(400);
})

test('shouldn´t delete because the platform doesn´t exist', async () => {
    await request(app).delete(`/api/v1/platforms/${unexistingPlatformId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
})

test('should delete a platform', async () => {
    await request(app).delete(`/api/v1/platforms/${platformToDelete._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
})

afterAll(async () => {
    await mongoose.connection.close();
});