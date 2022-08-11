const mongoose = require("mongoose")

class Database{
    constructor(){
        this.connect()
    }
    connect(){
        try {
            mongoose.connect(process.env.MONGODB_URL)
            .then(()=>console.log(`Successfully Connected to Database`))
        } catch (error) {
            
            this.connect()
        }
    }
}

module.exports = new Database()

try {
    
} catch (error) {
    
}