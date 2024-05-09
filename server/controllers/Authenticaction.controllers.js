import AuthenticationService from "../services/index.js";
import jwt from "jsonwebtoken";
import { generateRefreshToken, generateToken } from "../utils/tokenManager.js";

export class AuthenticationController {
    static register = async (req, res) => {
        try {
            const user = await AuthenticationService.register(req.body);
            const { token, expiresIn } = generateToken(user.id);
            generateRefreshToken(user.id, res);
            return res.status(201).json({message:"Usuario registrado correctamente",token, expiresIn});
        } catch (error) {
            console.log(error.name);
            if (error.name === "ValidationError") {
                const err = {};
                for (let e in error.errors) {
                    err[e] = { message: error.errors[e].message };
                }
                console.log(err);
                //console.log(Object.entries(error.errors))
                // const err = Object.entries(error.errors).reduce((acc,[key,value]) => {
                //     acc[key] = {message: value.message}
                //     return acc;
                // },{})
                return res.status(400).json({ errors: err });
            } else {
                return res
                    .status(500)
                    .json({ error: "Error interno del servidor" });
            }
        }
    };

    static login = async (req, res) => {
        try {
            const user = await AuthenticationService.login(req.body);

            //Generar token JWT
            const { token, expiresIn } = generateToken(user.id);
            generateRefreshToken(user.id, res);

            return res.json({ message:"Sesión iniciada correctamente",token, expiresIn });
        } catch (error) {
            console.log(error);
            if (
                error.name === "existError" ||
                error.name === "invalidPassword"
            ) {
                return res.status(error.status).json({ error: error.message });
            } else {
                return res
                    .status(500)
                    .json({ error: "Error interno del servidor" });
            }
        }
    };

    static infoUser = async (req, res) => {
        try {
            console.log(req.uid);
            const user = await AuthenticationService.infoUser(req.uid);
            return res.json({ user });
        } catch (error) {
            return res.status(500).json({ error: "error del servidor" });
        }
    };

    static refreshToken = (req, res) => {
        try {
            const { token, expiresIn } = generateToken(req.uid);

            return res.json({ token, expiresIn });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ error: "Error interno del servidor" });
        }
    };

    static logout = (req, res) => {
        res.clearCookie("refreshToken");
        res.json({ ok: true });
    };
}
