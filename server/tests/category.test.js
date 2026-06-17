import request from 'supertest'
import app from "../app.js"
import {beforeAll,afterAll, test} from '@jest/globals'
import mongoose from 'mongoose';
import categoryModel from '../models/Category.model.js'
import userModel from "../models/User.model.js";
import { generateToken } from '../utils/tokenManager.js';
import { deleteImages } from '../utils/cloudinary.js';

let category;
const fakeImage = Buffer.from( 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X3ZcAAAAASUVORK5CYII=',
                'base64');
let token;
let unexistingCategoryId = new mongoose.Types.ObjectId

beforeAll(async () => {
    await categoryModel.deleteMany({})
    await userModel.deleteMany({})
    
    category = await categoryModel.create({
        name: 'Categoria de prueba',
        normalizedName: 'categoria-de-prueba',
        description: 'Es una categoria de prueba',
        // image: {
        //     public_id: 'test/categories/Kimiko_ifzo7o',
        //     secure_url: 'https://res.cloudinary.com/jjose/image/upload/v1781548950/test/categories/Kimiko_ifzo7o.png'
        // }
        image: {
            public_id: 'test/categories/Kimiko_ifzo7a',
            secure_url: 'https://res.cloudinary.com/jjose/image/upload/v1781548950/test/categories/Kimiko_ifzo7a.png'
        }
    })
    const admin = await userModel.create({
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

});

test('should get all categories', async() => {
    await request(app).get('/api/v1/categories')
        .expect(200)
})

test('should get a category', async () => {
    await request(app).get(`/api/v1/categories/${category._id}`)
        .expect(200)
})

test('should fail because the category doesn´t exist', async () => {
    await request(app).get(`/api/v1/categories/${unexistingCategoryId}`)
        .expect(404)
})

test('should create a category', async () => {
    await request(app).post('/api/v1/categories')
        .set('Authorization', `Bearer ${token}`)
        .field('name', 'Formula 1')
        .field('description', 'Categoria donde poder hablar del Nano')
        .attach('image', fakeImage, 'test.png')
        .expect(200)
})

test('should fail creating a category because the name is taken', async () => {
    await request(app).post('/api/v1/categories')
        .set('Authorization', `Bearer ${token}`)
        .field('name', 'Categoria de prueba')
        .field('description', 'Categoria donde poder hablar del Nano')
        .attach('image', fakeImage, 'test.png')
        .expect(400)
})

test('should fail because the category doesn´t exist', async () => {
    await request(app).delete(`/api/v1/categories/${unexistingCategoryId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
})

test('should delete a category', async () => {
    await request(app).delete(`/api/v1/categories/${category._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
})

afterAll(async () => {
    await deleteImages('test/categories')
    await mongoose.connection.close();
});