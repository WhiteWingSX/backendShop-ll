import { v4 as uuidv4 } from 'uuid';
import { productDBManager } from './productDBManager.js';
import { cartDBManager } from './cartDBManager.js';
import TicketsRepository from '../repository/TicketsRepository.js';

class TicketService {
    async purchaseCart(cartId, purchaserEmail) {
        const cart = await cartDBManager.getCartByID(cartId);
        if (!cart) throw new Error('Carrito no encontrado');

        const purchasable = [];
        const notProcessed = [];
        let amount = 0;

        for (const item of cart.products) {
            const prod = item.product;
            if (!prod) {
                notProcessed.push({ product: item.product, reason: 'NOT_FOUND' });
                continue;
            }
            if (prod.stock >= item.quantity) {
                purchasable.push({ product: prod, quantity: item.quantity });
            } else {
                notProcessed.push({ product: prod._id, reason: 'NO_STOCK' });
            }
        }

        for (const p of purchasable) {
            await productDBManager.decrementStock(p.product._id, p.quantity);
            amount += p.product.price * p.quantity;
        }

        let ticket = null;
        if (purchasable.length) {
            ticket = await TicketsRepository.create({
                code: uuidv4(),
                amount,
                purchaser: purchaserEmail,
                products: purchasable.map(p => ({
                    product: p.product._id,
                    quantity: p.quantity,
                    price: p.product.price
                }))
            });

            await cartDBManager.removeMany(cartId, purchasable.map(p => p.product._id));
        }

        return {
            status: purchasable.length ? (notProcessed.length ? 'partial' : 'success') : 'failed',
            ticket,
            notProcessed
        };
    }
}

export default new TicketService();
