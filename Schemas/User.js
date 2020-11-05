const mongoose = require('mongoose');
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
const Schema = mongoose.Schema;
const userSchema = new Schema({
    userName: { type: String, unique: true, required: true },
    hash: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    city: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
});

userSchema.set('toJSON', { virtuals: true });


module.exports = mongoose.model('users', userSchema);