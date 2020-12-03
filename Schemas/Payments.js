const mongoose = require('mongoose');
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
const Schema = mongoose.Schema;
const paymentsSchema = new Schema({
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    subscriptionType: { type: Number, required: true },
    paymentId: { type: String, required: false },
    date: { type: Date, required: true },

});

paymentsSchema.set('toJSON', { virtuals: true });


module.exports = mongoose.model('payments', paymentsSchema);