import request from 'supertest'
import app from "../app.js"
import {beforeAll,afterAll, test} from '@jest/globals'
import reviewModel from '../models/Review.model.js'
import mongoose from 'mongoose'
import userModel from '../models/User.model.js'
import { generateToken } from '../utils/tokenManager.js';
import gameModel from '../models/Game.model.js'

let review;
let user;
let token;
let unexistingGameId = new mongoose.Types.ObjectId;
let screenshotIdToDelete = 'feifef4adefef';
let game;
let game2;
let unexistingReviewId = new mongoose.Types.ObjectId;
let moderatedReview;
let review2;
let game3;

beforeAll(async () => {
    await userModel.deleteMany({})
    await gameModel.deleteMany({})
    await reviewModel.deleteMany({})

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

    game2 = new gameModel({
        _id: new mongoose.Types.ObjectId,
        name: 'Isaac',
        normalizedName: 'isaac',
        description: 'Dispara lagrimas para acabar con los monstruos y llegar hasta mamá',
        developmentCompany: 'Edmunf',
        releaseDate: '2023-02-20',
        platforms: [new mongoose.Types.ObjectId, new mongoose.Types.ObjectId],
        genres: [new mongoose.Types.ObjectId, new mongoose.Types.ObjectId],
    })
    game2.mainImage = {
        public_id: process.env.CLOUDINARY_FOLDER + 'games/' + game2._id + '/ueufueuaeuf',
        secure_url: 'fejifjejfiejifjes'
    }
    await game2.save();

    user = await userModel.create({
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

    review = await reviewModel.create({
        content: 'La historia de este juego es brutal, te romperá el corazón pero te hará consciente del amor de un animal',
        rating: {
            overall: 89,
            story: 95,
            gameplay: 89,
            technicalSection: 88,
            art: 96,
            sound: 93
        },
        game: game._id,
        user: user._id
    })

    moderatedReview = await reviewModel.create({
        content: 'Hay que matar a la bastarda de mamá.Me encanta porque cada partida no tiene nada que ver con la anterior, y si ganas, desbloqueas items nuevos que te ayudarán más adelante',
        rating: {
            overall: 89,
            story: 95,
            gameplay: 89,
            technicalSection: 88,
            art: 96,
            sound: 93
        },
        game: game2._id,
        user: user._id,
        isModerated: true,
        moderatedBy: new mongoose.Types.ObjectId,
        moderatedAt: Date.now(),
        moderationReason: 'Lenguaje inapropiado'
    })

    review2 = await reviewModel.create({
        content: 'Isaac es de lo mejorcito que hay de videojuegos, te da muchisimas horas de diversión y ninguna partida es igual',
        rating: {
            overall: 89,
            story: 95,
            gameplay: 89,
            technicalSection: 88,
            art: 96,
            sound: 93
        },
        game: game2._id,
        user: new mongoose.Types.ObjectId
    })

    game3 = new gameModel({
        _id: new mongoose.Types.ObjectId,
        name: 'FIFA 26',
        normalizedName: 'fifa-26',
        description: 'Simulador de futbol, juega con las estrella de este deporte',
        developmentCompany: 'EA',
        releaseDate: '2026-02-20',
        platforms: [new mongoose.Types.ObjectId, new mongoose.Types.ObjectId],
        genres: [new mongoose.Types.ObjectId, new mongoose.Types.ObjectId],
    })
    game3.mainImage = {
        public_id: process.env.CLOUDINARY_FOLDER + 'games/' + game3._id + '/ueufueuaeuf',
        secure_url: 'fejifjejfiejifjes'
    }
    await game3.save();

    let res = generateToken(user._id, user.roles)
    token = res.token
})

test('should fail creating a review because the game doesn´t exist', async () => {
    await request(app).post(`/api/v1/games/${unexistingGameId}/reviews`)
        .set('Authorization', `Bearer ${token}`)
        .send({
            content: 'El juego más triste que he probado pero tiene una historia brutal',
            rating: {
                overall: 89,
                story: 95,
                gameplay: 89,
                technicalSection: 88,
                art: 96,
                sound: 93
            }
        })
       .expect(404)
})

test('should fail creating a review beacause the user already reviewed the gam', async () => {
    await request(app).post(`/api/v1/games/${game._id}/reviews`)
        .set('Authorization', `Bearer ${token}`)
        .send({
            content: 'El juego más triste que he probado pero tiene una historia brutal',
            rating: {
                overall: 89,
                story: 95,
                gameplay: 90,
                technicalSection: 88,
                art: 96,
                sound: 93
            }
        })
       .expect(400)
})

test('should create a review', async () => {
    await request(app).post(`/api/v1/games/${game3._id}/reviews`)
        .set('Authorization', `Bearer ${token}`)
        .send({
            content: 'El juego más triste que he probado pero tiene una historia brutal',
            rating: {
                overall: 89,
                story: 95,
                gameplay: 89,
                technicalSection: 88,
                art: 96,
                sound: 93
            }
        })
       .expect(200)
})

test('should fail getting the reviews of a game because the game doesn´t exist', async() => {
    await request(app).get(`/api/v1/games/${unexistingGameId}/reviews`)
        .expect(404)
})

test('should get all reviews of a game', async() => {
    await request(app).get(`/api/v1/games/${game._id}/reviews`)
        .expect(200)
})

test('should fail getting a review because it doesn´t exist', async () => {
    await request(app).get(`/api/v1/reviews/${unexistingReviewId}`)
        .expect(404)
})

test('should get a review', async () => {
    await request(app).get(`/api/v1/reviews/${review._id}`)
        .expect(200)
})

test('should fail editing a review because it doesn´t exist', async () => {
    await request(app).put(`/api/v1/reviews/${unexistingReviewId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
            content: 'El juego más triste que he probado pero tiene una historia brutal',
            rating: {
                overall: 99,
                story: 96,
                gameplay: 90,
                technicalSection: 90,
                art: 96,
                sound: 94
            }
        })
        .expect(404)
})

test('should fail editing a review because it is moderated', async () => {
    await request(app).put(`/api/v1/reviews/${moderatedReview._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
            content: 'El juego más triste que he probado pero tiene una historia brutal',
            rating: {
                overall: 99,
                story: 96,
                gameplay: 90,
                technicalSection: 90,
                art: 96,
                sound: 94
            }
        })
        .expect(409)
})

test('should fail editing a review because it is a review of another user', async () => {
    await request(app).put(`/api/v1/reviews/${review2._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
            content: 'Juegazo',
            rating: {
                overall: 99,
                story: 96,
                gameplay: 90,
                technicalSection: 90,
                art: 96,
                sound: 94
            }
        })
        .expect(403)
})

test('should edit a review', async () => {
    await request(app).put(`/api/v1/reviews/${review._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
            content: 'El juego más triste que he probado pero tiene una historia brutal',
            rating: {
                overall: 99,
                story: 96,
                gameplay: 90,
                technicalSection: 90,
                art: 96,
                sound: 94
            }
        })
        .expect(200)
})

test('should fail deleting a review because it doesn´t exist', async () => {
    await request(app).delete(`/api/v1/reviews/${unexistingReviewId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
})

test('should fail deleting a review because the review was written by another user', async () => {
    await request(app).delete(`/api/v1/reviews/${review2._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403)
})

test('should fail deleting a review because the review is moderated', async () => {
    await request(app).delete(`/api/v1/reviews/${moderatedReview._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(409)
})

test('should delete a review', async () => {
    await request(app).delete(`/api/v1/reviews/${review._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
})

afterAll(async () => {
    await mongoose.connection.close();
});