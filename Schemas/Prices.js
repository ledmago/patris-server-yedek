const mongoose = require('mongoose');
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
const Schema = mongoose.Schema;
const paymentsSchema = new Schema({

    month: { type: Number, required: true },
    price: { type: Number, required: true },
    currency: { type: String, required: true, default: "USD" },
    lang: { type: String, required: true, default: "en" },
    // tr: { type: Object, required: true },
    // ru: { type: Object, required: true },
    // en: { type: Object, required: true },
    // fa: { type: Object, required: true },
    // ar: { type: Object, required: true },

});

paymentsSchema.set('toJSON', { virtuals: true });


module.exports = mongoose.model('prices', paymentsSchema);