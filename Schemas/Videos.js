const mongoose = require('mongoose');
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
const Schema = mongoose.Schema;
const videoSchema = new Schema({
    categoryId: { type: String, required: true },
    videoName: { type: String, required: true },
    videoSource: { type: String, required: true },
    videoNumber: { type: Number, required: true, default: 1 },
    duration: { type: Number, required: false },
    thumb: { type: Object, required: false },
    freeTrial: { type: Boolean, required: false, default: false },


});

videoSchema.set('toJSON', { virtuals: true });


module.exports = mongoose.model('videos', videoSchema);