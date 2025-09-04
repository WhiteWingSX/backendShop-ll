import cartModel from '../dao/models/cartModel.js';

class CartsRepository {
    async create(data)                     { return cartModel.create(data); }
    async getById(id)                      { return cartModel.findById(id).populate('products.product'); }
    async addProduct(cartId, productId, qty = 1) {
        return cartModel.findOneAndUpdate(
            { _id: cartId, 'products.product': { $ne: productId } },
            { $push: { products: { product: productId, quantity: qty } } },
            { new: true }
        );
    }
    async incProduct(cartId, productId, qty = 1) {
        return cartModel.findOneAndUpdate(
            { _id: cartId, 'products.product': productId },
            { $inc: { 'products.$.quantity': qty } },
            { new: true }
        );
    }
    async removeMany(cartId, productIds) {
        return cartModel.findByIdAndUpdate(
            cartId,
            { $pull: { products: { product: { $in: productIds } } } },
            { new: true }
        );
    }
}

export default new CartsRepository();
