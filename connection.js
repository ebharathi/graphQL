const mongoose=require('mongoose')


const connect=async()=>{
    try {
      const con=await mongoose.connect("mongodb+srv://projectone:projectone@cluster0.dzrb8.mongodb.net/2023?retryWrites=true&w=majority")
      if(con)
       console.log("Connection established.")
    } catch (error) {
      console.log("FAILED TO CONNECTED MONGODB")
      console.log(error)
    }
}
module.exports={connect}