module.exports = {
    port: process.env.PORT || 3000,
    ip: process.env.IP || "0.0.0.0",
    intervals: {
        short: 5000,
        medium: 10000,
        long: 60000
    }
}