const mongoose = require("mongoose")

class Database{
    constructor(){
        this.connect()
    }
    connect(){
        try {
            mongoose.connect(process.env.MONGODB_URL)
            .then(()=>{console.log("Successfully connected with Mongo Atlas")})
        } catch (error) {
            console.log("Reconnecting to DB")
            this.connect()
        }
    }
}

module.exports = new Database()