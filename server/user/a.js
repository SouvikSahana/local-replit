const express= require("express")

const app= express()

app.get("/",(req,res)=>{
    res.send({messgae:"Server is running well"})
})

app.listen(5001,()=>{
    console.log("Server is running")
})