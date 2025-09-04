import { cartModel } from "./models/cartModel.js";
import {ticketModel} from "./models/ticketModel.js";
import {v4 as uuidv4 } from "uuid"

class cartDBManager {

    constructor(productDBManager) {
        this.productDBManager = productDBManager;
    }

    async getAllCarts() {
        return cartModel.find();
    }

    async getProductsFromCartByID(cid) {
        const cart = await cartModel.findOne({_id: cid}).populate('products.product');

        if (!cart) throw new Error(`El carrito ${cid} no existe!`);

        return cart;
    }

    async createCart() {
        return await cartModel.create({products: []});
    }

    async addProductByID(cid, pid) {
        await this.productDBManager.getProductByID(pid);

        const cart = await cartModel.findOne({ _id: cid});

        if (!cart) throw new Error(`El carrito ${cid} no existe!`);

        let i = null;
        const result = cart.products.filter(
            (item, index) => {
                if (item.product.toString() === pid) i = index;
                return item.product.toString() === pid;
            }
        );

        if (result.length > 0) {
            cart.products[i].quantity += 1;
        } else {
            cart.products.push({
                product: pid,
                quantity: 1
            });
        }
        await cartModel.updateOne({ _id: cid }, { products: cart.products});

        return await this.getProductsFromCartByID(cid);
    }

    async deleteProductByID(cid, pid) {
        await this.productDBManager.getProductByID(pid);

        const cart = await cartModel.findOne({ _id: cid});

        if (!cart) throw new Error(`El carrito ${cid} no existe!`);

        let i = null;
        const newProducts = cart.products.filter(item => item.product.toString() !== pid);

        await cartModel.updateOne({ _id: cid }, { products: newProducts});

        return await this.getProductsFromCartByID(cid);
    }

    async updateAllProducts(cid, products) {

        //Validate if exist products
        for (let key in products) {
            await this.productDBManager.getProductByID(products[key].product);
        }

        await cartModel.updateOne({ _id: cid }, { products: products });

        return await this.getProductsFromCartByID(cid)
    }

    async updateProductByID(cid, pid, quantity) {

        if (!quantity || isNaN(parseInt(quantity))) throw new Error(`La cantidad ingresada no es válida!`);

        await this.productDBManager.getProductByID(pid);

        const cart = await cartModel.findOne({ _id: cid});

        if (!cart) throw new Error(`El carrito ${cid} no existe!`);

        let i = null;
        const result = cart.products.filter(
            (item, index) => {
                if (item.product.toString() === pid) i = index;
                return item.product.toString() === pid;
            }
        );

        if (result.length === 0) throw new Error(`El producto ${pid} no existe en el carrito ${cid}!`);

        cart.products[i].quantity = parseInt(quantity);

        await cartModel.updateOne({ _id: cid }, { products: cart.products});

        return await this.getProductsFromCartByID(cid);
    }

    async deleteAllProducts(cid) {

        await cartModel.updateOne({ _id: cid }, { products: [] });

        return await this.getProductsFromCartByID(cid)
    }

    //ruta para el detalle
    async purchaseCart(cid, purchaserEmail) {
        const cart = await this.getProductsFromCartByID(cid);

        if (!cart.products.length) throw new Error(`El carrito ${cid} está vacío!`);

        const purchased = [];
        const notPurchased = [];
        let totalAmount = 0;

        for (const item of cart.products) {
            try {
                const updatedProduct = await this.productDBManager.decrementStock(item.product._id, item.quantity);

                purchased.push({
                    product: updatedProduct._id,
                    quantity: item.quantity,
                    price: item.product.price
                });

                totalAmount += item.product.price * item.quantity;
            } catch (error) {
                notPurchased.push({
                    product: item.product._id,
                    quantity: item.quantity,
                    reason: error.message
                });
            }
        }

        cart.products = cart.products.filter(p =>
            notPurchased.find(np => np.product.toString() === p.product._id.toString())
        );

        await cart.save();

        let ticket = null;

        if (purchased.length > 0) {
            ticket = await ticketModel.create({
                code: uuidv4(),
                amount: totalAmount,
                purchaser: purchaserEmail
            });
        }

        return {ticket, purchased, notPurchased};
    }
}

export { cartDBManager };
