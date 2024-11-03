const express= require('express')

const app=express()
const port=process.env.PORT||5002

app.get("/",(req,res)=>{
    res.status(200).send({message:"Welcome to CodeSpace."})
})

app.listen(port,()=>{
    console.log("Server is running on "+port);
})