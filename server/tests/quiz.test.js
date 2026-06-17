import request from 'supertest'
import app from "../app.js"
import {beforeAll, test, afterAll} from '@jest/globals'
import { generateToken } from '../utils/tokenManager.js';
import userModel from "../models/User.model.js";
import mongoose, { mongo } from 'mongoose';
import quizModel from '../models/Quiz.model.js'
import { deleteImages } from '../utils/cloudinary.js';
import questionModel from '../models/Question.model.js'

let admin;
let token;
const fakeImage = Buffer.from( 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X3ZcAAAAASUVORK5CYII=',
                'base64');
let quiz;
let quizToDelete;
let user;
let userToken;
let session;
let unexistingQuizId = new mongoose.Types.ObjectId;

beforeAll(async() => {
    await userModel.deleteMany({})
    await quizModel.deleteMany({})
    await questionModel.deleteMany({})
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
    let t1 = new mongoose.Types.ObjectId;
    let t2 = new mongoose.Types.ObjectId;
    quiz = await quizModel.create({
        title: 'Prueba',
        description: 'Demuestra tu sabiduría sobre una de las mayores compañias de videojuegos',
        difficulty: 'Fácil',
        tags: [t1, t2],
        numQuestions: 10,
        badge: {
            name: 'Insignia de prueba',
            normalizedName: 'insignia-de-prueba',
            image: {
                public_id: process.env.DEFAULT_PIC_ID,
                secure_url: process.env.DEFAULT_PIC_URL
            }
        }
    })

    let user = await userModel.create({
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

    let question = await questionModel.create({
        question: '¿Qué compañía creó la consola NES?',
        answer: 'Nintendo',
        distractors: ['Sega', 'Sony', 'Atari'],
        tags: [t1],
        difficulty: 'Fácil',
        normalizedDifficulty: 'facil'
    })

    let res = generateToken(admin._id, admin.roles)
    token = res.token
    let res2 = generateToken(user._id, user.roles)
    userToken = res2.token
})

test('should get all quizzes', async () => {
    await request(app).get('/api/v1/quizzes')
        .expect(200)
})

test('should get all quizzes with admin token', async () => {
    await request(app).get('/api/v1/quizzes')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
})

test('should get all quizzes being an admin', async () => {
    await request(app).get('/api/v1/quizzes/admin')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
})

test('should get the number of quizzes', async () => {
    await request(app).get('/api/v1/quizzes/totalQuizzes')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
})

test('shouldn´t create a quiz because its badge name is already taken', async () => {
    let tag1 = new mongoose.Types.ObjectId;
    let tag2 = new mongoose.Types.ObjectId;
    let tag3 = new mongoose.Types.ObjectId;

    let tags = [tag1.toString(), tag2.toString() , tag3.toString()]
    
    await request(app).post('/api/v1/quizzes')
        .set('Authorization', `Bearer ${token}`)
        .field('title', 'Experto informatico')
        .field('description', 'Desafío tremendamente difícil para quien quiera probar suerte')
        .field('difficulty', 'Difícil')
        .field('tags', tags)
        .field('numQuestions', 25)
        .field('badgeName', 'Insignia de prueba')
        .attach('image', fakeImage, 'image.png')
        .expect(400)
})

test('should create a quiz', async () => {
    let tag1 = new mongoose.Types.ObjectId;
    let tag2 = new mongoose.Types.ObjectId;
    let tag3 = new mongoose.Types.ObjectId;

    let tags = [tag1.toString(), tag2.toString() , tag3.toString()]

    const response = await request(app).post('/api/v1/quizzes')
        .set('Authorization', `Bearer ${token}`)
        .field('title', 'Solo para los expertos de la informática')
        .field('description', 'Desafío tremendamente difícil para quien quiera probar suerte')
        .field('difficulty', 'Difícil')
        .field('tags', tags)
        .field('numQuestions', 25)
        .field('badgeName', 'Informático de la NASA')
        .attach('image', fakeImage, 'image.png')
        .expect(200)


    quizToDelete = response.body.createdQuiz
})


test('should fail editing a quiz because the quiz doesn´t exist', async () => {
    let tag1 = new mongoose.Types.ObjectId;
    let tag2 = new mongoose.Types.ObjectId;

    let tags = [tag1.toString(), tag2.toString()]
    
    await request(app).put(`/api/v1/quizzes/${unexistingQuizId}`)
        .set('Authorization', `Bearer ${token}`)
        .field('title', 'Prueba')
        .field('description', 'Demuestra tu sabiduría sobre una de las mayores compañias de videojuegos')
        .field('difficulty', 'Fácil')
        .field('tags', tags)
        .field('numQuestions', 13)
        .field('badgeName', 'Insignia de prueba')
        .expect(404)
})

test('should edit a quiz', async () => {
    let tag1 = new mongoose.Types.ObjectId;
    let tag2 = new mongoose.Types.ObjectId;

    let tags = [tag1.toString(), tag2.toString()]
    
    await request(app).put(`/api/v1/quizzes/${quiz._id}`)
        .set('Authorization', `Bearer ${token}`)
        .field('title', 'Prueba')
        .field('description', 'Demuestra tu sabiduría sobre una de las mayores compañias de videojuegos')
        .field('difficulty', 'Fácil')
        .field('tags', tags)
        .field('numQuestions', 13)
        .field('badgeName', 'Insignia de prueba')
        .attach('image', fakeImage, 'questionImage.png')
        .expect(200)
})

test('should fail deleting a quiz because it doesn´t exist', async() => {
    await request(app).delete(`/api/v1/quizzes/${unexistingQuizId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
})

test('should delete a quiz', async() => {
    await request(app).delete(`/api/v1/quizzes/${quizToDelete._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
})

test('should start to play a quiz', async () => {
    const response = await request(app).post(`/api/v1/quizzes/${quiz._id}/start`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
    
    session = response.body
})

// test('should answer a question playing the quiz', async () => {
//     await request(app).post(`/api/v1/quizzes/session/${session.sessionId}/answer`)
//         .set('Authorization', `Bearer ${userToken}`)
//         .send({
//             answer: 'Nintendo'
//         })
//         .expect(200)
// })

test('should get a session', async () => {
    await request(app).get(`/api/v1/quizzes/session/${session.sessionId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
})

test('should end a session', async () => {
    await request(app).put(`/api/v1/quizzes/session/${session.sessionId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
})

afterAll(async () => {
    await deleteImages('test/badges')
    await mongoose.connection.close();
});