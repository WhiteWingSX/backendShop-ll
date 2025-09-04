import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import userModel from "../dao/models/userModel.js";
import { encryptPassword } from "../utils/userPassUtils.js";
import UserDTO from "../dto/usersDTO.js";
import crypto from "crypto"; //nuevo
import UsersRepository from "../repository/UsersRepository.js"; //nuevo
import bcrypt from "bcrypt"; //nuevo

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

        const safeUser = new UserDTO(user);
        return res.json({
            status: 'Usuario encontrado',
            user: safeUser
        });
    })(req, res, next);
});

// Recuperacion de contraseña
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;

    const user = await UsersRepository.getByEmail(email);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const token = crypto.randomBytes(20).toString("hex");

    await UsersRepository.setResetToken(email, token, Date.now() + 3600000);

    const resetLink = `http://localhost:8080/api/sessions/reset-password/${token}`;

    console.log("Link de recuperación:", resetLink);

    res.json({ message: "Se ha enviado enlace de recuperacion" });
});

router.post("/reset-password/:token", async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await UsersRepository.getByResetToken(token);
    if (!user) return res.status(400).json({ error: "Enlace inválido o expirado" });

    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
        return res.status(400).json({ error: "No se puede utilizar la misma contraseña" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await UsersRepository.updatePassword(user._id, hashedPassword);

    res.json({ message: "Contraseña actualizada con éxito" });
});

export default router;
