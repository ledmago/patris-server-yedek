const mongoose = require('mongoose');
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
const Schema = mongoose.Schema;
const videoSchema = new Schema({
    categoryId: { type: String, required: true },
    title: { type: String, required: true },
    videoSource: { type: String, required: true },

});

videoSchema.set('toJSON', { virtuals: true });


module.exports = mongoose.model('videos', videoSchema);