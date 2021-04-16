const mongoose = require('mongoose');

const vusSchema = new mongoose.Schema({
    partitionKey: { type: String, required: true },
    sortKey: { type: String, required: true },
    gsiSortKey: { type: String, required: false },
    imageUrl: { type: String, required: false },
    name: { type: String, required: false },
    route: { type: String, required: false },
    updatedAt: { type: String, required: false },
    lat: { type: Number, required: false },
    location: { type: String, required: false },
    long: { type: Number, required: false },
    currentLocation: { type: Boolean, required: false },
    locationIndex: { type: Number, required: false },
    password: { type: String, required: false },
    phoneNumber: { type: String, required: false },
    salt: { type: String, required: false },
    type: { type: String, required: false },
    busId: { type: String, required: false },
    registerCount: { type: Number, required: false },
    state: { type: String, required: false },
    isCancellation: { type: Boolean, required: false },
    content: { type: String, required: false },
    notice: { type: String, required: false },
    noticeType: { type: String, required: false },
    userId: { type: String, required: false },
    busNumber: { type: String, required: false },
    driver: {
        name: { type: String, required: false },
        phone: { type: String, required: false },
        userId: { type: String, required: false },
    },
    limitCount: { type: Number, required: false },
    previousMonthState: { type: String, required: false },
    registerDate: { type: String, required: false },
});

module.exports = mongoose.model('TEST-vus', vusSchema);
