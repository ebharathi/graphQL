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
const {User,File}=require('./schema')

const app=express();
app.use(express.json())
app.use(cors())
//mongoDB
connect()

//graphQL
var schema = buildSchema(`
  type User{
     _id:ID
     name:String
     email:String
     password:String
     token:String
  }
  type File{
    _id:ID
    title:String
    author:ID
    content:String
  }
  type Query {
    user(token:String):User
    login(email:String,password:String):User
    userFiles(token:String):[File]
    file(id:ID):File
  }
  type Mutation{
    createUser(name:String,email:String,password:String):User
    createFile(title:String,author:String):File
    updateFile(id:ID,content:String):File
  }
`)
var resolver = {
  //create a user  
  createUser:async({name,email,password})=>{
    try {
            console.log("-->",name,"-->",email,"-->",password)
            const newUser=new User();
            newUser.name=name;
            newUser.email=email;
            const hashedPassword=await bcrypt.hash(password,10);
            newUser.password=hashedPassword;
            const savedUser=await newUser.save();
            console.log("[+]User saved")
            return savedUser;
    } catch (error) {
          console.log("[-]error creating user--->",error?.message)
          throw new Error("Failed to create a user")
    }
  },
  //find a user
    user:async({token})=>{
        try {
            console.log("user token->",token)
            const decoded=jwt.verify(token,'qazwsxplmokn');
            console.log("User verification: ",decoded);
            const user=await User.findById(decoded.userId)
            return user;
        } catch (error) {
             throw new User("User details failed to fetch")
        }
    },
    //login a userc
    login:async({email,password})=>{
        try {
            console.log("-->",password,'-->',email)
            const user=await User.find({email:email})
            console.log("user--->",user)
            if(user.length==0)
             {
              console.log("no user found[-]")
              throw new Error("No user found!!")
             }
            if(user.length!=0)
            {
              const isPasswordSame=await bcrypt.compare(password,user[0]?.password)
              if(isPasswordSame)
              {
                // console.log("user found--->",user)
                const token=jwt.sign({userId:user[0]._id},'qazwsxplmokn',{expiresIn:'5h'})
                user[0].token=token;
                return user[0];
              }
              else
                throw new Error("Invalid user!!")
            }
        } catch (error) {
             throw new Error(error.message)
        }
    },
    //create a file
    createFile:async({title,author})=>{
        try {
          console.log("creating file")
          const newFile=new File();
          const decodedToken=jwt.verify(author,'qazwsxplmokn');
          newFile.title=title;
          newFile.author=decodedToken.userId;
          newFile.save();
          console.log("[+]new file created")
          return newFile;
        } catch (error) {
            throw new Error("Failed to create new file")
        }
    },
    updateFile:async({id,content})=>{
        try {
           const file=await File.findById(id);
           file.content=content;
           file.save();
           console.log("[+]File content updated")
           return file;
        } catch (error) {
            throw new Error("Failed to update the file[-]")
        }
    },
    userFiles:async({token})=>{
       try {
        const decodedToken=jwt.verify(token,'qazwsxplmokn');
        const files=await File.find({author:decodedToken?.userId});
        console.log("Files retrieved-->",files.length);
        return files;
       } catch (error) {
          throw new Error("Failed to fetch user files")
       }
    },
    file:async({id})=>{
        try {
            const file=await File.findById(id);
            console.log("[+]Fetched File")
            return file;
        } catch (error) {
            throw new Error("Failed to fetch file details[+]")
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