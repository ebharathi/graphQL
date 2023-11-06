const express=require('express')
const cors=require('cors');
const bcrypt=require('bcryptjs')
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
  }
  type Query {
    user(_id:ID):User
  }
  type Mutation{
    createUser(name:String,email:String,password:String):User
  }
`)
var resolver = {
  createUser:async({name,email,password})=>{
     const newUser=new User();
     newUser.name=name;
     newUser.email=email;
     const hashedPassword=await bcrypt.hash(password,10);
     newUser.password=hashedPassword;
     const savedUser=await newUser.save();
     return savedUser;
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