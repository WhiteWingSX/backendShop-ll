import mongoose from "mongoose";

const productCollection = "users";

const userSchema = mongoose.Schema({
    first_name: {
        type: String,
        require: true,
    },

    last_name: {
        type: String,
        require: true,
    },

    email: {
        type: String,
        require: true,
        unique: true,
    },

    age: {
        type: Number,
        require: true
    },

    password: {
        type: String,
        require: true
    },

    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'carts'
    },

    role: {
        type: String,
        require: true
    },
});

const userModel = mongoose.model(productCollection, userSchema);

export default userModel;
