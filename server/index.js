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
})

app.get('/files',async (req,res)=>{
    const fileTree= await generateFileTree('./user')
    return res.json({tree: fileTree})
})
server.listen(5000,()=>{
    console.log("Server is running...")
})

async function generateFileTree(directory){
    const tree={}

   async function builtTree(currentDir,currentTree){
        const files= await fs.readdir(currentDir)
        for(const file of files){
            const filePath= path.join(currentDir,file)
            const stat=await fs.stat(filePath)
            if(stat.isDirectory()){
                currentTree[file]={}
                await builtTree(filePath,currentTree[file])
            }else{
                currentTree[file]=null
            }
        }
    }
    await builtTree(directory,tree)
    return tree
}