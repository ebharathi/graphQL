const express=require('express')
const cors=require('cors');
//import for graphQL
const { graphqlHTTP } = require("express-graphql")
const { buildSchema } = require("graphql")
const app=express();
app.use(express.json())
app.use(cors())
//graphQL
var schema = buildSchema(`
  type Query {
    hello: String
  }
`)
var root = {
  hello: () => {
    return "Hello world!"
  },
}
//connecting graphQL
app.use('/graphql',graphqlHTTP({
    schema:schema,
    rootValue:root,
    graphiql:true
}))
app.listen(5000,()=>{
    console.log("GRAPHQL SERVER RUNNING")
})