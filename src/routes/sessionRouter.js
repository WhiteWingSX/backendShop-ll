import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import userModel from "../dao/models/userModel.js";
import { encryptPassword } from "../utils/userPassUtils.js";

const router = Router();

// Registro
router.post('/register', async (req, res, next) => {

    const {first_name, last_name, email, age, password} = req.body;

    if (!first_name || !last_name || !email || !age || !password) {
        return res.status(400).json({error: "Todos los campos son requeridos"});
    }

    try {
        const userExists = await userModel.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: "La credencial ya existe" });
        }
        next();
    } catch (error) {
            return res.status(500).json({ error });
    }
    },

    passport.authenticate('register', { session: false }), (req, res) => {
    res.send({ status: 'success', message: 'Usuario registrado' });
}


);

// Login
router.post('/login',
    async (req, res, next) => {

        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(400).json({error: "Todos los campos son requeridos"});
        }

        try {
            const user = await userModel.findOne({ email });

            if (!user || !encryptPassword(user, password)) {
                return res.status(401).json({ error: "Credenciales invalidas" });
            }

            req.user = user;
            next();
        } catch (error) {
            throw new Error (error)
        }
    },

    passport.authenticate('login', { session: false }), (req, res) => {
        const user = req.user;
        const token = jwt.sign({ user }, 'jwtSecretKey', { expiresIn: '24h' });
        res.send({ status: 'Ingreso exitoso', token });
    }
);

// Current
router.get('/current', (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (error, user) => {
        if (error) return next(error, 'Problemas con token');

        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Token invalido'
            });
        }

        req.user = user;
        return res.json({ status: 'Usuario Encontrado', user: req.user });
    })(req, res, next);
});

export default router;
