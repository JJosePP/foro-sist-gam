import request from 'supertest'
import app from "../app.js"
import {test} from '@jest/globals'
import userModel from "../models/User.model.js";
import mongoose from 'mongoose';
import { createRefreshToken, generateToken } from '../utils/tokenManager.js';
import { deleteImages } from '../utils/cloudinary.js';
import { accessSync } from 'fs-extra';


const user = {
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
    description: 'Amante de los videojuegos en busca de persona con las que hablar'
}
let refreshToken;
let token;
const fakeImage = Buffer.from( 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X3ZcAAAAASUVORK5CYII=',
                'base64');

let bannedUserRefreshToken;

beforeAll(async () => {
//   await mongoose.connect(process.env.MONGO_URI);
    await userModel.deleteMany({})
    const pepito = await userModel(user).save()
    refreshToken = createRefreshToken(pepito._id)
    let res = generateToken(pepito._id, pepito.roles)
    token = res.token

    const bannedUser = await userModel.create({
        userName: 'marc',
        normalizedUserName: 'marc',
        name: 'Marcos',
        lastName: 'Pérez',
        email: 'marc@gmail.com',
        password: 'Pepit0s*',
        profilePic: {
            public_id: process.env.DEFAULT_PIC_ID,
            secure_url: process.env.DEFAULT_PIC_URL
        },
        description: 'Me gusta hablar sobre juegos de acción',
        authorized: false,
        bannedUntil: '2026-06-30T00:00:00.000+00:00',
    })
    bannedUserRefreshToken = createRefreshToken(bannedUser._id)
    let deleteOn = Date.now() + 30*24*60*60*1000;
    const userMarkedForDelete = await userModel.create({
        userName: 'Mari4',
        normalizedUserName: 'mari4',
        name: 'Maria',
        lastName: 'Pérez',
        email: 'mari4@gmail.com',
        password: 'Pepit0s*',
        profilePic: {
            public_id: process.env.DEFAULT_PIC_ID,
            secure_url: process.env.DEFAULT_PIC_URL
        },
        description: 'Los juegos cozy son lo mejor',
        deleteOn: deleteOn
    })

});
test('Should sign up for a user', async () => {
    await request(app).post('/api/v1/register')
        .field('userName', 'test')
        .field('name', 'test')
        .field('lastName', 'test test')
        .field('email', 'test@gmail.com')
        .field('description', 'testing endpoint')
        .field('password', 'T3sting*')
        .field('confirmPassword', 'T3sting*')
        .expect(201)
})

test('should fail trying to sign up because userName is taken', async () => {
    await request(app).post('/api/v1/register')
        .field('userName', 'pepito')
        .field('name', 'test')
        .field('lastName', 'test test')
        .field('email', 'test2@gmail.com')
        .field('description', 'testing endpoint')
        .field('password', 'T3sting*')
        .field('confirmPassword', 'T3sting*')
        .expect(400)
})

test('should fail trying to sign up because email is taken', async () => {
    await request(app).post('/api/v1/register')
        .field('userName', 'test2')
        .field('name', 'test')
        .field('lastName', 'test test')
        .field('email', 'pepito@gmail.com')
        .field('description', 'testing endpoint')
        .field('password', 'T3sting*')
        .field('confirmPassword', 'T3sting*')
        .expect(400)
})

test('should fail trying to sign up because both userName and email are taken', async () => {
    await request(app).post('/api/v1/register')
        .field('userName', 'pepito')
        .field('name', 'test')
        .field('lastName', 'test test')
        .field('email', 'test@gmail.com')
        .field('description', 'testing endpoint')
        .field('password', 'T3sting*')
        .field('confirmPassword', 'T3sting*')
        .expect(400)
})

test('Should sign up for a user with image', async () => {
    await request(app).post('/api/v1/register')
        .field('userName', 'test2')
        .field('name', 'test2')
        .field('lastName', 'test test')
        .field('email', 'test2@gmail.com')
        .field('description', 'testing endpoint')
        .field('password', 'T3sting*')
        .field('confirmPassword', 'T3sting*')
        .attach('image', fakeImage, 'profile.png')
        .expect(201)
})

test('shouldn´t sign in because user doesn´t exist', async() => {
    await request(app).post('/api/v1/login')
        .send({
            userName: 'test3',
            password: 'Pepit0s*'
        })
        .expect(404)
})

test('shouldn´t sign in because password is wrong', async() => {
    await request(app).post('/api/v1/login')
        .send({
            userName: 'pepito',
            password: 'Pepit0s5*'
        })
        .expect(401)
})

test('should sign in for a user', async() => {
    await request(app).post('/api/v1/login')
        .send({
            userName: 'pepito',
            password: 'Pepit0s*'
        })
        .expect(200)
})

test('shouldn´t sign in because user is banned', async () => {
    await request(app).post('/api/v1/login')
        .send({
            userName: 'marc',
            password: 'Pepit0s*'
        })
        .expect(403)
})

test('should sign in and cancel the delete order', async () => {
    await request(app).post('/api/v1/login')
        .send({
            userName: 'Mari4',
            password: 'Pepit0s*'
        })
        .expect(200)
})

test('shouldn´t refresh token because user is banned', async () => {
    await request(app).get('/api/v1/refresh')
        .set('Cookie', `refreshToken=${bannedUserRefreshToken}`)
        .expect(403)
})

test('should refresh token', async () => {
    await request(app).get('/api/v1/refresh')
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(200)
})

test('should log out for a user', async() => {
    await request(app).post('/api/v1/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(201)
})

afterAll(async () => {
    await deleteImages('test/profile')
    await mongoose.connection.close();
});
