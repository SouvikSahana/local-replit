const http=require('http')
const express= require('express')
const {Server: SocketServer} =require('socket.io')
const pty= require('node-pty')
const path=require('path')
const fs= require("fs/promises")
const cors= require('cors')
const chokidar= require('chokidar')

const ptyProcess= pty.spawn('bash', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.INIT_CWD ,
    env: process.env
  });

const app= express()
app.use(cors())
const server= http.createServer(app)
const io=new SocketServer(server,{
    cors:'*'
})

ptyProcess.onData(data=>{
    
    io.emit('terminal:data',data)
})

chokidar.watch('./user').on('all',(event,path)=>{
    io.emit("file:refresh",path)
})
io.on("connection",(socket)=>{
    console.log("Socket connected "+ socket.id)
    socket.on('terminal:write',(data)=>{
        ptyProcess.write(data)
    })
    socket.on("file:change",async({path,content})=>{
        await fs.writeFile('./user'+path,content)
    })
})

app.get('/files',async (req,res)=>{
    const fileTree= await generateFileTree('./user')
    return res.json({tree: fileTree})
})
app.get("/file/data",async(req,res)=>{
    try{
        const path=req.query.path
        const fileData= await fs.readFile("./user"+path,'utf8')
        return res.status(200).json({fileContent:fileData})
    }catch(error){
        return res.status(500).send({message:error.message})
    }
})
server.listen(5000,()=>{
    console.log("Server is running...")
})

async function generateFileTree(directory){
   async function builtTree(currentDir){
    const tree=[]
        const files= await fs.readdir(currentDir)
        for(const file of files){
            const filePath= path.join(currentDir,file)
            const stat=await fs.stat(filePath)
            if(stat.isDirectory()){
                if(file!='node_modules'){
                    tree.push({name: file, children:await builtTree(filePath)})
                }
            }else{
                tree.push({name: file})
            }
        }
        return tree
    }
    const tree=await builtTree(directory)
    return tree
}