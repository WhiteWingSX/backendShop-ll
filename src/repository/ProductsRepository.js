import productModel from '../dao/models/productModel.js';

class ProductsRepository {
    async create(data)                   { return productModel.create(data); }
    async getById(id)                    { return productModel.findById(id); }
    async getMany(filter = {}, opts = {}){ return productModel.find(filter, null, opts); }
    async update(id, patch)              { return productModel.findByIdAndUpdate(id, patch, { new: true }); }
    async delete(id)                     { return productModel.findByIdAndDelete(id); }
    async decrementStock(id, qty)        {
        return productModel.findOneAndUpdate(
            { _id: id, stock: { $gte: qty } },
            { $inc: { stock: -qty } },
            { new: true }
        );
    }
}

export default new ProductsRepository();
