import request from 'supertest'
import app from "../app.js"
import {beforeAll, test, afterAll} from '@jest/globals'
import userModel from "../models/User.model.js";
import { generateToken } from '../utils/tokenManager.js';
import { deleteImages } from '../utils/cloudinary.js';
import mongoose from 'mongoose';
import gameModel from '../models/Game.model.js'
import reviewModel from '../models/Review.model.js'

const fakeMainImage = Buffer.from( 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X3ZcAAAAASUVORK5CYII=','base64');
let token;
let game;
let screenshotIdToDelete = 'feifef4adefef'
let createdGame
let unexistingGameId = new mongoose.Types.ObjectId
beforeAll(async () => {
    await userModel.deleteMany({})
    await gameModel.deleteMany({})
    await reviewModel.deleteMany({})

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

    game = new gameModel({
        _id: new mongoose.Types.ObjectId('6a309592f6cdbf84797e9763'),
        name: 'Hachi',
        normalizedName: 'hachi',
        description: 'Aventura perruna',
        developmentCompany: 'Ocho',
        releaseDate: '2024-02-20',
        platforms: [new mongoose.Types.ObjectId('6995d877f3a162c4bc5eeba0'), new mongoose.Types.ObjectId('6995d877f3a162c4bc5eebac')],
        genres: [new mongoose.Types.ObjectId('6995c77e6f02df93ecd273d0'), new mongoose.Types.ObjectId('6995c77e6f02df93ecd273d4')]
    })
    game.mainImage = {
        public_id: process.env.CLOUDINARY_FOLDER + 'games/' + game._id + '/deijiea7e',
        secure_url: 'fjeifjei'
    }
    let sc1 = {
        public_id: process.env.CLOUDINARY_FOLDER + 'games/' + game._id + '/' + screenshotIdToDelete,
        secure_url: 'fjeifjei'
    }
    let sc2 = {
        public_id: process.env.CLOUDINARY_FOLDER + 'games/' + game._id + '/ueuaudeua7',
        secure_url: 'fjeifefei'
    }
    game.screenshots.push(sc1, sc2)
    await game.save()

    let res = generateToken(admin._id, admin.roles)
    token = res.token
})


test('should get all games', async () => {
    await request(app).get('/api/v1/games')
        .expect(200)
})

test('should filter games', async () => {
    await request(app).get(`/api/v1/games/?search=hac&genres=${game.genres[0]._id}&platforms=${game.platforms[0]._id}`)
        .expect(200)
})

test('should get a game searched by name', async () => {
    await request(app).get('/api/v1/games/search?search=isaac')
        .expect(200)
})

test('should get all games', async () => {
     await request(app).get('/api/v1/games/admin')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
})

test('should get a game', async() => {
    await request(app).get(`/api/v1/games/${game._id}`)
        .expect(200)
})

test('should fail beacuse the game doesn´t exist', async() => {
    await request(app).get(`/api/v1/games/${unexistingGameId}`)
        .expect(404)
})

test('shouldn´t create because a game with the same name already exists', async () => {
    await request(app).post('/api/v1/games')
        .set('Authorization', `Bearer ${token}`)
        .field('name', 'Hachi')
        .field('developmentCompany', 'Acme')
        .field('releaseDate', '2024-02-20')
        .field('description', 'Sumérgete en el mundo apasionante de las pruebas')
        .field('platforms', ['6995d877f3a162c4bc5eeba0', '6995d877f3a162c4bc5eebac'])
        .field('genres', ['6995c77e6f02df93ecd273d0', '6995c77e6f02df93ecd273d4'])
        .attach('mainImage', fakeMainImage, 'test.png')
        .expect(400)
})

test('should create a game', async () => {
    const response = await request(app).post('/api/v1/games')
        .set('Authorization', `Bearer ${token}`)
        .field('name', 'Juego de prueba')
        .field('developmentCompany', 'Acme')
        .field('releaseDate', '2024-02-20')
        .field('description', 'Sumérgete en el mundo apasionante de las pruebas')
        .field('platforms', ['6995d877f3a162c4bc5eeba0', '6995d877f3a162c4bc5eebac'])
        .field('genres', ['6995c77e6f02df93ecd273d0', '6995c77e6f02df93ecd273d4'])
        .attach('mainImage', fakeMainImage, 'test.png')
        .attach('screenshots', fakeMainImage, 'screenshot1.png')
        .attach('screenshots', fakeMainImage, 'screenshot2.png')
        .expect(201)

    createdGame = response.body.createdGame
},8000)


test('shouldn´t edit a game because the game doesn´t exist', async () => {
    await request(app).put(`/api/v1/games/${unexistingGameId}`)
        .set('Authorization', `Bearer ${token}`)
        .field('name', 'Hachi 2')
        .field('developmentCompany', 'Acme')
        .field('releaseDate', '2024-02-23')
        .field('description', 'Aventura perruna')
        .field('platforms', ['6995d877f3a162c4bc5eeba0', '6995d877f3a162c4bc5eebac'])
        .field('genres', ['6995c77e6f02df93ecd273d0', '6995c77e6f02df93ecd273d4'])
        .expect(404)
})

test('shouldn´t edit a game because the new name is already taken', async () => {
    await request(app).put(`/api/v1/games/${createdGame._id}`)
        .set('Authorization', `Bearer ${token}`)
        .field('name', 'Hachi')
        .field('developmentCompany', 'Acme')
        .field('releaseDate', '2024-02-23')
        .field('description', 'Aventura perruna')
        .field('platforms', ['6995d877f3a162c4bc5eeba0', '6995d877f3a162c4bc5eebac'])
        .field('genres', ['6995c77e6f02df93ecd273d0', '6995c77e6f02df93ecd273d4'])
        .expect(400)
})

test('should edit a game', async () => {
    await request(app).put(`/api/v1/games/${game._id}`)
        .set('Authorization', `Bearer ${token}`)
        .field('name', 'Hachi 2')
        .field('developmentCompany', 'Acme')
        .field('releaseDate', '2024-02-23')
        .field('description', 'Aventura perruna')
        .field('platforms', ['6995d877f3a162c4bc5eeba0', '6995d877f3a162c4bc5eebac'])
        .field('genres', ['6995c77e6f02df93ecd273d0', '6995c77e6f02df93ecd273d4'])
        .attach('mainImage', fakeMainImage, 'test.png')
        .attach('screenshots', fakeMainImage, 'screenshot1.png')
        .attach('screenshots', fakeMainImage, 'screenshot2.png')
        .attach('screenshots', fakeMainImage, 'screenshot3.png')
        .expect(200)
},8000)

test('shouldn´t edit a game because the user chose too many files', async () => {
    await request(app).put(`/api/v1/games/${game._id}`)
        .set('Authorization', `Bearer ${token}`)
        .field('name', 'Hachi 2')
        .field('developmentCompany', 'Acme')
        .field('releaseDate', '2024-02-23')
        .field('description', 'Aventura perruna')
        .field('platforms', ['6995d877f3a162c4bc5eeba0', '6995d877f3a162c4bc5eebac'])
        .field('genres', ['6995c77e6f02df93ecd273d0', '6995c77e6f02df93ecd273d4'])
        .attach('mainImage', fakeMainImage, 'test.png')
        .attach('screenshots', fakeMainImage, 'screenshot1.png')
        .attach('screenshots', fakeMainImage, 'screenshot2.png')
        .attach('screenshots', fakeMainImage, 'screenshot3.png')
        .attach('screenshots', fakeMainImage, 'screenshot4.png')
        .attach('screenshots', fakeMainImage, 'screenshot5.png')
        .attach('screenshots', fakeMainImage, 'screenshot6.png')
        .attach('screenshots', fakeMainImage, 'screenshot7.png')
        .attach('screenshots', fakeMainImage, 'screenshot8.png')
        .attach('screenshots', fakeMainImage, 'screenshot9.png')
        .expect(400)
})

test('shouldn´t delete a screenshot because the game doesn´t exist', async () => {
    let public_id = game.screenshots[0].public_id
    let imageId = public_id.substring(public_id.lastIndexOf('/') + 1)

    await request(app).put(`/api/v1/games/${unexistingGameId}/${imageId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
})

test('shouldn´t delete a screenshot because the ID doesn´t exist', async () => {
    let imageId = 'prueba'

    await request(app).put(`/api/v1/games/${game._id}/${imageId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400)
})

test('should delete a screenshot', async () => {
    let public_id = game.screenshots[0].public_id
    let imageId = public_id.substring(public_id.lastIndexOf('/') + 1)

    await request(app).put(`/api/v1/games/${game._id}/${imageId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
})

test('shouldn´t delete a game because it doesn´t exist', async () => {
    await request(app).delete(`/api/v1/games/${unexistingGameId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
})

test('should delete a game', async () => {
    await request(app).delete(`/api/v1/games/${createdGame._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
})


afterAll(async () => {
    await deleteImages('test/games')
    await mongoose.connection.close();
});