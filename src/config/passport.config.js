import passport from 'passport';
import local from 'passport-local';
import jwt from 'passport-jwt';
import userModel from '../dao/models/userModel.js';
import { hashPassword, encryptPassword } from '../utils/userPassUtils.js';

const LocalStrategy = local.Strategy;
const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;

export const iniciarPassport = () => {

    // Registro
    passport.use('register',
        new LocalStrategy(
        {
            usernameField: 'email',
            passReqToCallback: true
        },
        async (req, email, password, done) => {
            const { first_name, last_name, age } = req.body;
            try {
                let user = await userModel.findOne({ email });
                if (user) return done(null, false);

                const newUser = {
                    first_name,
                    last_name,
                    email,
                    age,
                    password: hashPassword(password)
                };
                let result = await userModel.create(newUser);
                return done(null, result);
            } catch (error) {
                return done(error);
            }
        }
    ));

    // Login
    passport.use('login',
        new LocalStrategy(
        {
            usernameField: 'email'
        },
        async (email, password, done) => {
            try {
                const user = await userModel.findOne({ email });
                if (!user || !encryptPassword(user, password)) return done(null, false);

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    ));

    // Validación JWT
    passport.use('jwt', new JWTStrategy(
        {
            jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
            secretOrKey: 'jwtSecretKey'
        },
        async (jwt_payload, done) => {
            try {
                return done(null, jwt_payload.user);
            } catch (error) {
                return done(error);
            }
        }
    ));
};
