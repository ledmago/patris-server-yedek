const mongoose = require('mongoose');
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
const Schema = mongoose.Schema;
const categorySchema = new Schema({
    text: { type: String, required: true },
});

categorySchema.set('toJSON', { virtuals: true });


module.exports = mongoose.model('categories', categorySchema);