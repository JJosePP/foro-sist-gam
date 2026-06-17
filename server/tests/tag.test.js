import request from 'supertest'
import app from "../app.js"
import {beforeAll, test, afterAll} from '@jest/globals'
import { generateToken } from '../utils/tokenManager.js';
import userModel from "../models/User.model.js";
import tagModel from '../models/Tag.model.js'
import mongoose from 'mongoose';


let admin;
let token;
let tagToDelete;
let unexistingTagId = new mongoose.Types.ObjectId;

beforeAll(async () => {
    await userModel.deleteMany({})
    await tagModel.deleteMany({})

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

test('should get all tags', async () => {
    await request(app).get('/api/v1/tags')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
})

test('should create a tag', async () => {
    const response = await request(app).post('/api/v1/tags')
        .set('Authorization', `Bearer ${token}`)
        .send({
            name: 'hardware'
        })
        .expect(200);

    tagToDelete = response.body.createdTag
})

test('should fail creating a tag because there is another tag with the same name', async () => {
    await request(app).post('/api/v1/tags')
        .set('Authorization', `Bearer ${token}`)
        .send({
            name: 'hardware'
        })
        .expect(400);
})

test('should fail deleting a tag because it doesn´t exist', async () => {
    await request(app).delete(`/api/v1/tags/${unexistingTagId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
})

test('should delete a tag', async () => {
    await request(app).delete(`/api/v1/tags/${tagToDelete._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
})

afterAll(async () => {
    await mongoose.connection.close();
});