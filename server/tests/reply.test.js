import request from 'supertest'
import app from "../app.js"
import {beforeAll,afterAll, test} from '@jest/globals'
import mongoose from 'mongoose';
import { generateToken } from '../utils/tokenManager.js';
import userModel from "../models/User.model.js";
import replyModel from '../models/Reply.model.js'
import threadModel from '../models/Thread.model.js'

let token;
let reply;
let thread;
let unexistingThreadId = new mongoose.Types.ObjectId;
let closedThread;
let unexistingReplyId = new mongoose.Types.ObjectId;
let reply2;
let moderatedReply;

beforeAll(async () => {
    await userModel.deleteMany({})
    await replyModel.deleteMany({})
    await threadModel.deleteMany({})

    const user = await userModel.create({
        userName: 'jose',
        normalizedUserName: 'jose',
        name: 'Jose',
        lastName: 'Carrero',
        email: 'joseCa@gmail.com',
        password: 'Pepit0s*',
        profilePic: {
            public_id: process.env.DEFAULT_PIC_ID,
            secure_url: process.env.DEFAULT_PIC_URL
        },
        description: 'Amante de los videojuegos en busca de persona con las que hablar'
    })

    thread = await threadModel.create({
        user: new mongoose.Types.ObjectId,
        title: 'Reglas básicas del foro',
        content: 'Estas son las reglas básicas del foro: no faltes al respeto, no uses lenguaje soez y no hagas spam',
        category: new mongoose.Types.ObjectId,
    })

    reply = await replyModel.create({
        content: 'Muy buen aporte amigo, ya tengo ganas de leer otra de tus guías',
        user: user._id,
        thread: thread._id
    })

    reply2 = await replyModel.create({
        content: 'Tremendo aporte',
        user: new mongoose.Types.ObjectId,
        thread: thread._id
    })

    moderatedReply = await replyModel.create({
        content: 'ifejekoeofkef',
        user: user._id,
        thread: thread._id,
        isModerated: true,
        moderatedBy: new mongoose.Types.ObjectId,
        moderatedAt: Date.now(),
        moderationReason: 'Spam'
    })

    closedThread = await threadModel.create({
        user: new mongoose.Types.ObjectId,
        title: 'Reglas básicas del foro',
        content: 'Estas son las reglas básicas del foro: no faltes al respeto, no uses lenguaje soez y no hagas spam',
        category: new mongoose.Types.ObjectId,
        status: 'Cerrado'
    })

    let res = generateToken(user._id, user.roles)
    token = res.token
})



test('should fail creating a reply because the thread doesn´t exist', async () => {
    await request(app).post(`/api/v1/threads/${unexistingThreadId}/replies`)
        .set('Authorization', `Bearer ${token}`)
        .send({
            content: 'Esta es una respuesta de prueba'
        })
        .expect(404)
})

test('should fail creating a reply because the thread is closed', async () => {
    await request(app).post(`/api/v1/threads/${closedThread._id}/replies`)
        .set('Authorization', `Bearer ${token}`)
        .send({
            content: 'Esta es una respuesta de prueba'
        })
        .expect(409)
})

test('should create a reply', async () => {
    await request(app).post(`/api/v1/threads/${thread._id}/replies`)
        .set('Authorization', `Bearer ${token}`)
        .send({
            content: 'Esta es una respuesta de prueba'
        })
        .expect(201)
})

test('should fail editing a reply because it doesn´t exist', async () => {
    await request(app).put(`/api/v1/replies/${unexistingReplyId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
            content: 'Muy buen aporte amigo, ya tengo ganas de leer otra de tus guías. Edito para darte las gracias!'
        })
        .expect(404)
})

test('should fail editing a reply because it is a reply of another user', async () => {
    await request(app).put(`/api/v1/replies/${reply2._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
            content: 'Muy buen aporte amigo, ya tengo ganas de leer otra de tus guías. Edito para darte las gracias!'
        })
        .expect(403)
})

test('should fail editing a reply because it is a moderated reply', async () => {
    await request(app).put(`/api/v1/replies/${moderatedReply._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
            content: 'Editando una respuesta moderada'
        })
        .expect(409)
})

test('should edit a reply', async () => {
    await request(app).put(`/api/v1/replies/${reply._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
            content: 'Muy buen aporte amigo, ya tengo ganas de leer otra de tus guías. Edito para darte las gracias!'
        })
        .expect(200)
})

test('should fail getting all replies of a thread because it doesn´t exist', async () => {
    await request(app).get(`/api/v1/threads/${unexistingThreadId}/replies`)
        .expect(404)
})

test('should get all replies of a thread', async () => {
    await request(app).get(`/api/v1/threads/${thread._id}/replies`)
        .expect(200)
})

afterAll(async () => {
    await mongoose.connection.close();
});