import request from 'supertest'
import app from "../app.js"
import {beforeAll,afterAll, test} from '@jest/globals'
import userModel from "../models/User.model.js";
import { generateToken } from '../utils/tokenManager.js';
import mongoose from 'mongoose';
import categoryModel from '../models/Category.model.js'
import threadModel from '../models/Thread.model.js'

let category;
let thread;
let thread2;
let thread3;
let thread4;
let threadToDelete;
let token;
let userToken;
let unexistingCategoryId = new mongoose.Types.ObjectId;
let unexistingThreadId = new mongoose.Types.ObjectId;
beforeAll(async () => {
    await categoryModel.deleteMany({})
    await userModel.deleteMany({})
    await threadModel.deleteMany({})
    category = await categoryModel.create({
        name: 'Categoria de prueba',
        normalizedName: 'categoria-de-prueba',
        description: 'Es una categoria de prueba',
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

    const user = await userModel.create({
        userName: 'Mari3',
        normalizedUserName: 'mari3',
        name: 'Maria',
        lastName: 'Caballero',
        email: 'mcab@gmail.com',
        password: 'Pepit0s*',
        profilePic: {
            public_id: process.env.DEFAULT_PIC_ID,
            secure_url: process.env.DEFAULT_PIC_URL
        },
        description: 'Me encantan los rpgs',
        roles: ['user']
    })

    thread = await threadModel.create({
        user: admin._id,
        title: 'Reglas básicas del foro',
        content: 'Estas son las reglas básicas del foro: no faltes al respeto, no uses lenguaje soez y no hagas spam',
        category: category._id,
    })

    thread2 = await threadModel.create({
        user: user._id,
        title: 'Duda the witcher 3',
        content: 'Por favor, digánme como puedo encontrar la espada de gutz que he leido que está como easter egg',
        category: new mongoose.Types.ObjectId,
    })

    thread3 = await threadModel.create({
        user: user._id,
        title: 'Ultima carrera de F1',
        content: 'Habeis visto la robada en la ultima carrera? no puedo creer que algunos tontos de aqui apoyen al filipino que ha chocado a Alonso',
        category: new mongoose.Types.ObjectId,
        isModerated: true,
        moderatedBy: admin._id,
        moderatedAt: Date.now(),
        moderationReason: 'Lenguaje inapropiado'
    })

    thread4 = await threadModel.create({
        user: user._id,
        title: 'Tips para cs',
        content: 'Queria pedir consejo para mejorar en el counter',
        category: new mongoose.Types.ObjectId,
        status: 'Cerrado'
    })

    let res = generateToken(admin._id, admin.roles);
    token = res.token

    res = generateToken(user._id, user.roles);
    userToken = res.token
})

test('should fail getting threads because the category is missing', async () => {
    await request(app).get(`/api/v1/threads`)
        .expect(400)
})

test('should get all threads', async () => {
    await request(app).get(`/api/v1/threads?category=${category._id}`)
        .expect(200)
})

test('should get all threads which title contains the introduced word', async () => {
    await request(app).get(`/api/v1/threads?category=${category._id}&search=juego`)
        .expect(200)
})

test('should get the newest threads', async () => {
    await request(app).get(`/api/v1/threads/newestThreads`)
        .expect(200)
})

test('should fail getting a thread because it doesn´t exist', async () => {
    await request(app).get(`/api/v1/threads/${unexistingThreadId}`)
        .expect(404)
})

test('should get a thread', async () => {
    await request(app).get(`/api/v1/threads/${thread._id}`)
        .expect(200)
})

test('should fail creating a thread because the category doesn´t exist', async () => {
    await request(app).post(`/api/v1/threads`)
        .set('Authorization', `Bearer ${token}`)
        .send({
            title: 'Hilo de prueba',
            content: 'Este es un hilo de prueba',
            category: unexistingCategoryId
        })
        .expect(404);
})

test('should create a thread', async () => {
    await request(app).post(`/api/v1/threads`)
        .set('Authorization', `Bearer ${token}`)
        .send({
            title: 'Hilo de prueba',
            content: 'Este es un hilo de prueba',
            category: category._id
        })
        .expect(201);
})

test('should fail editing a thread because it doesn´t exist', async () => {
    await request(app).put(`/api/v1/threads/${unexistingThreadId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
            title: 'Reglas básicas del foro',
            content: 'Estas son las reglas básicas del foro: no faltes al respeto, no uses lenguaje soez y no hagas spam. Me faltó añadir que espero que tengamos una buena comunidad'
        })
        .expect(404)
})

test('should fail editing a thread because it was created by another user', async () => {
    await request(app).put(`/api/v1/threads/${thread2._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
            title: 'Reglas básicas del foro',
            content: 'Estas son las reglas básicas del foro: no faltes al respeto, no uses lenguaje soez y no hagas spam. Me faltó añadir que espero que tengamos una buena comunidad'
        })
        .expect(403)
})

test('should fail editing a thread because it is moderated', async () => {
    await request(app).put(`/api/v1/threads/${thread3._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
            title: 'Ultima carrera F1',
            content: 'Quiero pedir perdon'
        })
        .expect(409)
})

test('should fail editing a thread because it is closed', async () => {
    await request(app).put(`/api/v1/threads/${thread4._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
            title: 'Tips para cs2',
            content: 'Holaaa, me podeis dar consejos para mejorar en counter?? Gracias'
        })
        .expect(409)
})

test('should edit a thread', async () => {
    await request(app).put(`/api/v1/threads/${thread._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
            title: 'Reglas básicas del foro',
            content: 'Estas son las reglas básicas del foro: no faltes al respeto, no uses lenguaje soez y no hagas spam. Me faltó añadir que espero que tengamos una buena comunidad'
        })
        .expect(200)
})

test('should fail changing the thread´s status because it doesn´t exist', async () => {
    await request(app).patch(`/api/v1/threads/${unexistingThreadId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
            status: 'Cerrado'
        })
        .expect(404)
})

test('should change the thread´s status', async () => {
    await request(app).patch(`/api/v1/threads/${thread._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
            status: 'Cerrado'
        })
        .expect(200)
})

afterAll(async () => {
    await mongoose.connection.close();
});