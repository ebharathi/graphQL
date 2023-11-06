const express=require('express')
const cors=require('cors');
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
//import for graphQL
const { graphqlHTTP } = require("express-graphql")
const { buildSchema } = require("graphql")
//mongoDB
const {connect}=require('./connection')
//schema
const {User}=require('./schema')

const app=express();
app.use(express.json())
app.use(cors())
//mongoDB
connect()
//data
const usersData=[
    {
        id:1,
        name:"john",
        age:21,
        email:"john@gmail.com"
    },
    {
        id:2,
        name:"Mikel",
        age:18,
        email:"mikel@gmail.com"
    }
]
//graphQL
var schema = buildSchema(`
  type User{
     _id:ID
     name:String
     email:String
     password:String
     token:String
  }
  type Query {
    user(token:String):User
    login(name:String,email:String):User
  }
  type Mutation{
    createUser(name:String,email:String,password:String):User
  }
`)
var resolver = {
  //creaat a user  
  createUser:async({name,email,password})=>{
    try {
            const newUser=new User();
            newUser.name=name;
            newUser.email=email;
            const hashedPassword=await bcrypt.hash(password,10);
            newUser.password=hashedPassword;
            const savedUser=await newUser.save();
            return savedUser;
    } catch (error) {
          throw new Error("Failed to create a user")
    }
  },
  //find a user
    user:async({token})=>{
        try {
            const decoded=jwt.verify(token,'qazwsxplmokn');
            console.log("User verification: ",decoded);
            const user=await User.findById(decoded.userId)
            return user;
        } catch (error) {
             throw new User("User details failed to fetch")
        }
    },
    //login a user
    login:async({name,email})=>{
        try {
            const user=await User.find({name:name,email:email})
            console.log("user--->",user)
            const token=jwt.sign({userId:user[0]._id},'qazwsxplmokn',{expiresIn:'5h'})
            user[0].token=token;
            return user[0];
        } catch (error) {
             throw new Error("Login failed")
        }
    }  

}
//connecting graphQL
app.use('/graphql',graphqlHTTP({
    schema:schema,
    rootValue:resolver,
    graphiql:true
}))
app.listen(5000,()=>{
    console.log("GRAPHQL SERVER RUNNING")
})