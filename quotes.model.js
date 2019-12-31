const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Quote = new Schema(
    {
        quote_text:String,
        quote_author: String
    },
    {
            timestamps: true
    }
);

module.exports = mongoose.model('Quotes', Quote);
