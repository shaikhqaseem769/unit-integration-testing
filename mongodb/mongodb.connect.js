const mongoose = require("mongoose");

const connect = async() => {
    try {
        await mongoose.connect("mongodb://localhost:27017/to-do")
        // console.log(`Mongodb has been connected!`)
    } catch (err) {
        console.log(`Mongodb connect to failed!`,err)
        
    }
}


const disconnect = async () => {
  await mongoose.connection.close();
};

module.exports = {connect, disconnect}