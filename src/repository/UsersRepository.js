import userModel from '../dao/models/userModel.js';

class UsersRepository {
    async create(data)               { return userModel.create(data); }
    async getByEmail(email)          { return userModel.findOne({ email }); }
    async getById(id)                { return userModel.findById(id); }
    async updatePassword(id, hashed) { return userModel.findByIdAndUpdate(id, { password: hashed, resetPasswordToken: null, resetPasswordExpires: null }, { new: true }); }
    async updateRole(id, role)       { return userModel.findByIdAndUpdate(id, { role }, { new: true }); }

    async setResetToken(email, token, expires) {
        return userModel.findOneAndUpdate(
            { email },
            { resetPasswordToken: token, resetPasswordExpires: expires },
            { new: true }
        );
    }

    async getByResetToken(token) {
        return userModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
    }
}

export default new UsersRepository();
