import express from 'express';
import handlebars from 'express-handlebars';
import {Server} from 'socket.io';
import mongoose from 'mongoose';
import passport from 'passport';
import { iniciarPassport } from './config/passport.config.js';
import sessionRouter from './routes/sessionRouter.js';


import productRouter from './routes/productRouter.js';
import cartRouter from './routes/cartRouter.js';
import viewsRouter from './routes/viewsRouter.js';
import dotenv from 'dotenv';
import __dirname from './utils/constantsUtil.js';
import websocket from './websocket.js';

const app = express();

dotenv.config();

const uri = process.env.MONGO_URL;
mongoose.connect(uri);

// Passport
iniciarPassport();
app.use(passport.initialize());

//Handlebars Config
app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/../views');
app.set('view engine', 'handlebars');

//Middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

//Routers
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);
app.use('/api/sessions', sessionRouter);
app.use('/', viewsRouter);

const PORT = 8080;
const httpServer = app.listen(PORT, () => {
    console.log(`Start server in PORT ${PORT}`);
});

const io = new Server(httpServer);

websocket(io);
