import { Router } from 'express';
import { productDBManager } from '../dao/productDBManager.js';
import { uploader } from '../utils/multerUtil.js';
import { authorizeRoles } from '../middlewares/auth.js';
import passport from "passport";

const router = Router();
const ProductService = new productDBManager();

router.get('/', async (req, res) => {
    const result = await ProductService.getAllProducts(req.query);

    res.send({
        status: 'success',
        payload: result
    });
});

router.get('/:pid', async (req, res) => {

    try {
        const result = await ProductService.getProductByID(req.params.pid);
        res.send({
            status: 'success',
            payload: result
        });
    } catch (error) {
        res.status(400).send({
            status: 'error',
            message: error.message
        });
    }
});

router.post('/', passport.authenticate("jwt", {session: false}), authorizeRoles('admin'), uploader.array('thumbnails', 3),
    async (req, res) => {
        if (req.files) {
            req.body.thumbnails = req.files.map((file) => file.path);
        }

        try {
            const result = await ProductService.createProduct(req.body);
            res.send({
                status: 'success',
                payload: result
            });
        } catch (error) {
            res.status(400).send({
                status: 'error',
                message: error.message
            });
        }
    }
);

router.put('/:pid',passport.authenticate("jwt", {session: false}), authorizeRoles('admin'), uploader.array('thumbnails', 3),
    async (req, res) => {
        if (req.files) {
            req.body.thumbnails = req.files.map((file) => file.filename);
        }

        try {
            const result = await ProductService.updateProduct(req.params.pid, req.body);
            res.send({
                status: 'success',
                payload: result
            });
        } catch (error) {
            res.status(400).send({
                status: 'error',
                message: error.message
            });
        }
    }
);

router.delete('/:pid',passport.authenticate("jwt", {session: false}), authorizeRoles('admin'), async (req, res) => {
    try {
        const result = await ProductService.deleteProduct(req.params.pid);
        res.send({
            status: 'success',
            payload: result
        });
    } catch (error) {
        res.status(400).send({
            status: 'error',
            message: error.message
        });
    }
});

export default router;
