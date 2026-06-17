import request from 'supertest'
import app from "../app.js"
import {beforeAll, test, afterAll} from '@jest/globals'
import { generateToken } from '../utils/tokenManager.js';
import userModel from "../models/User.model.js";
import mongoose from 'mongoose';
import { deleteImages } from '../utils/cloudinary.js';

let admin;
let user;
let user2;
let adminToken;
let userToken;
let unexistingUserId = new mongoose.Types.ObjectId;
const fakeImage = Buffer.from( 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X3ZcAAAAASUVORK5CYII=',
                'base64');
let bannedUser;
beforeAll(async () => {
    await userModel.deleteMany({})

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
    adminToken = res.token

    user = await userModel.create({
        userName: 'marie',
        normalizedUserName: 'marie',
        name: 'Maria',
        lastName: 'Blanco',
        email: 'marie@gmail.com',
        password: 'Pepit0s*',
        profilePic: {
            public_id: process.env.DEFAULT_PIC_ID,
            secure_url: process.env.DEFAULT_PIC_URL
        },
        description: 'Me encantan los juegos de carreras',
        roles: ['user']
    })

    user2 = await userModel.create({
        userName: 'FRanki3',
        normalizedUserName: 'franki3',
        name: 'Francisco',
        lastName: 'Herrero',
        email: 'franki@gmail.com',
        password: 'Pepit0s*',
        profilePic: {
            public_id: process.env.DEFAULT_PIC_ID,
            secure_url: process.env.DEFAULT_PIC_URL
        },
        description: 'Lo mio son los simuladores',
        roles: ['user']
    })

    bannedUser = await userModel.create({
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

    let res2 = generateToken(user._id, user.roles)
    userToken = res2.token
})

test('should fail geting the info of a user because it doesn´t exist', async () => {
    await request(app).get(`/api/v1/users/${unexistingUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404)
})

test('should get the info of a user', async () => {
    await request(app).get(`/api/v1/users/${user._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
})

test('should get the info of the loged user', async () => {
    await request(app).get(`/api/v1/users/${user._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
})

test('should fail editing a user because it doesn´t exist', async () => {
    await request(app).put(`/api/v1/users/${unexistingUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .field('userName', 'P3p1t0')
        .field('name', 'Jose')
        .field('lastName', 'Carrillo')
        .field('email', 'pepito@gmail.com')
        .field('description', 'Me encantan los juegos roguelikes')
        .expect(404)
})

test('should fail editing the user because he is another user ', async () => {
    await request(app).put(`/api/v1/users/${user._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .field('userName', 'P3p1t0')
        .field('name', 'Jose')
        .field('lastName', 'Carrillo')
        .field('email', 'pepito@gmail.com')
        .field('description', 'Me encantan los juegos roguelikes')
        .expect(403)
})

test('should fail editing the user because the user name is taken', async () => {
    await request(app).put(`/api/v1/users/${admin._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .field('userName', 'marie')
        .field('name', 'Jose')
        .field('lastName', 'Carrillo')
        .field('email', 'pepito2@gmail.com')
        .field('description', 'Me encantan los juegos roguelikes')
        .attach('image', fakeImage, 'profile.png')
        .expect(400)
})

test('should fail editing the user because the email is taken', async () => {
    await request(app).put(`/api/v1/users/${admin._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .field('userName', 'P3p1t0')
        .field('name', 'Jose')
        .field('lastName', 'Carrillo')
        .field('email', 'marie@gmail.com')
        .field('description', 'Me encantan los juegos roguelikes')
        .attach('image', fakeImage, 'profile.png')
        .expect(400)
})

test('should fail editing the user because the userName is taken(user introduce his last email)', async () => {
    await request(app).put(`/api/v1/users/${admin._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .field('userName', 'FRanki3')
        .field('name', 'Jose')
        .field('lastName', 'Carrillo')
        .field('email', 'pepito@gmail.com')
        .field('description', 'Me encantan los juegos roguelikes')
        .attach('image', fakeImage, 'profile.png')
        .expect(400)
})

test('should fail editing the user because the email is taken (user introduce his last username)', async () => {
    await request(app).put(`/api/v1/users/${admin._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .field('userName', 'pepito')
        .field('name', 'Jose')
        .field('lastName', 'Carrillo')
        .field('email', 'franki@gmail.com')
        .field('description', 'Me encantan los juegos roguelikes')
        .attach('image', fakeImage, 'profile.png')
        .expect(400)
})

test('should fail editing the user because both, the userName and the email are taken', async () => {
    await request(app).put(`/api/v1/users/${admin._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .field('userName', 'marie')
        .field('name', 'Jose')
        .field('lastName', 'Carrillo')
        .field('email', 'franki@gmail.com')
        .field('description', 'Me encantan los juegos roguelikes')
        .attach('image', fakeImage, 'profile.png')
        .expect(400)
})



test('should change the only the username', async () => {
    await request(app).put(`/api/v1/users/${admin._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .field('userName', 'pepito2')
        .field('name', 'Jose')
        .field('lastName', 'Carrillo')
        .field('email', 'pepito@gmail.com')
        .field('description', 'Me encantan los juegos roguelikes')
        .attach('image', fakeImage, 'profile.png')
        .expect(200)
})

test('should edit a user (change username and email)', async () => {
    await request(app).put(`/api/v1/users/${admin._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .field('userName', 'pepit3')
        .field('name', 'Jose')
        .field('lastName', 'Carrillo')
        .field('email', 'pepito3@gmail.com')
        .field('description', 'Me encantan los juegos roguelikes')
        .attach('image', fakeImage, 'profile.png')
        .expect(200)
})

test('should fail banning a user because he doesn´t exist', async () => {
    await request(app).put(`/api/v1/users/ban/${unexistingUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
            bannedUntil: '2026-07-18'
        })
        .expect(404)
})

test('should fail banning a user because he is already banned', async () => {
    await request(app).put(`/api/v1/users/ban/${bannedUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
            bannedUntil: '2026-07-18'
        })
        .expect(400)
})

test('should ban a user', async () => {
    await request(app).put(`/api/v1/users/ban/${user._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
            bannedUntil: '2026-07-18'
        })
        .expect(200)
})

test('should fail unbanning a user because he doesn´t exist', async () => {
    await request(app).put(`/api/v1/users/unban/${unexistingUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404)
})

test('should fail unbanning a user because he isn´t banned', async () => {
    await request(app).put(`/api/v1/users/unban/${user2._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400)
})

test('should unban a user', async () => {
    await request(app).put(`/api/v1/users/unban/${user._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
})

test('should fail deleting a user because he doesn´t exist', async () => {
    await request(app).delete(`/api/v1/users/${unexistingUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404)
})

test('should fail delete a user because its another user', async () => {
    await request(app).delete(`/api/v1/users/${admin._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403)
})

test('should delete a user', async () => {
    await request(app).delete(`/api/v1/users/${user._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
})

test('should get the number of completed quizzes of a user', async () => {
    await request(app).get(`/api/v1/users/${user._id}/completedQuizzes`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
})

test('should get all users', async () => {
    await request(app).get(`/api/v1/users/`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
})


test('should fail changing the password of unexisting user', async () => {
    await request(app).patch(`/api/v1/users/changePassword/${unexistingUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
            password: 'J0s3C4R*',
            confirmPassword: 'J0s3C4R*'
        })
        .expect(404)
})

test('should fail changing the password of another user', async () => {
    await request(app).patch(`/api/v1/users/changePassword/${user._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
            password: 'J0s3C4R*',
            confirmPassword: 'J0s3C4R*'
        })
        .expect(403)
})

test('should fail changing the password because its the same password', async () => {
    await request(app).patch(`/api/v1/users/changePassword/${admin._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
            password: 'Pepit0s*',
            confirmPassword: 'Pepit0s*'
        })
        .expect(400)
})

test('should change the password of a user', async () => {
    await request(app).patch(`/api/v1/users/changePassword/${admin._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
            password: 'J0s3C4R*',
            confirmPassword: 'J0s3C4R*'
        })
        .expect(200)
})

afterAll(async () => {
    await deleteImages('test/profile')
    await mongoose.connection.close();
});

