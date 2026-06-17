import request from 'supertest'
import app from "../app.js"
import {beforeAll,afterAll, test} from '@jest/globals'
import mongoose from 'mongoose'
import userModel from '../models/User.model.js'
import { generateToken } from '../utils/tokenManager.js';
import questionModel from '../models/Question.model.js'
import { deleteImages } from '../utils/cloudinary.js';

let admin;
let token;
let question;
const fakeMainImage = Buffer.from( 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X3ZcAAAAASUVORK5CYII=','base64');
let unexistingQuestionId = new mongoose.Types.ObjectId;
let questionToEdit;

beforeAll(async () => {
    await userModel.deleteMany({})
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

    question = await questionModel.create({
        question: '¿Qué compañía creó la consola NES?',
        answer: 'Nintendo',
        distractors: ['Sega', 'Sony', 'Atari'],
        tags: [new mongoose.Types.ObjectId, new mongoose.Types.ObjectId],
        difficulty: 'Fácil',
        normalizedDifficulty: 'facil'
    })

    let res = generateToken(admin._id, admin.roles)
    token = res.token
})

test('should get all questions', async () => {
    await request(app).get('/api/v1/questions')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
})

test('should fail getting a question because the question doesn´t exist', async () => {
    await request(app).get(`/api/v1/questions/${unexistingQuestionId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
})

test('should get a questions', async () => {
    await request(app).get(`/api/v1/questions/${question._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
})


test('should create a question', async () => {
    let tag1 = new mongoose.Types.ObjectId;
    let tag2 = new mongoose.Types.ObjectId;
    let tag3 = new mongoose.Types.ObjectId;

    let tags = [tag1.toString(), tag2.toString() , tag3.toString()]

    const response = await request(app).post('/api/v1/questions/')
        .set('Authorization', `Bearer ${token}`)
        .field('question', '¿Qué empresa creó la consola Xbox?')
        .field('answer', 'Microsoft')
        .field('distractors', ['Sony', 'Nintendo', 'Sega'])
        .field('tags', tags)
        .field('difficulty', 'Fácil')
        .attach('image', fakeMainImage, 'image.png')
        .expect(200)
    
    questionToEdit = response.body.createdQuestion
})

test('should fail editing a question because it doesn´t exist', async () => {
    let tag1 = new mongoose.Types.ObjectId;
    let tag2 = new mongoose.Types.ObjectId;
    let tag3 = new mongoose.Types.ObjectId;

    let tags = [tag1.toString(), tag2.toString() , tag3.toString()]

    await request(app).put(`/api/v1/questions/${unexistingQuestionId}`)
        .set('Authorization', `Bearer ${token}`)
        .field('question', '¿Qué compañía creó la consola NES?')
        .field('answer', 'Nintendo')
        .field('distractors', ['Sega', 'Sony', 'Atari'])
        .field('tags', tags)
        .field('difficulty', 'Intermedio')
        .expect(404)
})

test('should edit a question', async () => {
    let tag1 = new mongoose.Types.ObjectId;
    let tag2 = new mongoose.Types.ObjectId;
    let tag3 = new mongoose.Types.ObjectId;

    let tags = [tag1.toString(), tag2.toString() , tag3.toString()]

    await request(app).put(`/api/v1/questions/${questionToEdit._id}`)
        .set('Authorization', `Bearer ${token}`)
        .field('question', '¿Qué empresa creó la consola Xbox?')
        .field('answer', 'Microsoft')
        .field('distractors', ['Sony', 'Nintendo', 'Sega'])
        .field('tags', tags)
        .field('difficulty', 'Intermedio')
        .attach('image', fakeMainImage, 'image.png')
        .expect(200)
})

test('should fail deleting a question because it doesn´t exist', async () => {
    await request(app).delete(`/api/v1/questions/${unexistingQuestionId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
})

test('should delete a question', async () => {
    await request(app).delete(`/api/v1/questions/${questionToEdit._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
})

afterAll(async () => {
    await deleteImages('test/questions')
    await mongoose.connection.close();
});