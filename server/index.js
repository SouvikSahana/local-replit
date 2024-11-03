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
    cwd: path.join(process.env.INIT_CWD || '') ,
    env: process.env
  });
const ptyProcessFolder= pty.spawn('bash', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: path.join(process.env.INIT_CWD || '') ,
    env: process.env
  });
var dirPath=path.join(__dirname)

const app= express()
app.use(cors())
app.use(express.json())
const server= http.createServer(app)
const io=new SocketServer(server,{
    cors:'*'
})

ptyProcess.onData(data=>{
    io.emit('terminal:data',data)
})
ptyProcessFolder.onData(data=>{
    io.emit('terminal:data-folder',data)
})
chokidar.watch('./playground',{
    ignored: /node_modules/
}).on('all',(event,path)=>{
    io.emit("file:refresh",path)
})
io.on("connection",(socket)=>{
    console.log("Socket connected "+ socket.id)
    socket.on('terminal:write',(data)=>{
        ptyProcess.write(data)
    })
    socket.on('terminal:write-folder',(data)=>{
        ptyProcessFolder.write(data)
    })
    socket.on("file:change",async({path,content})=>{
        await fs.writeFile(dirPath+'/playground'+path,content)
    })
    socket.on("terminal:refresh-folder",({path})=>{
        ptyProcessFolder.write(`cd ${dirPath}'${path}'\r`)
    })
})

app.get('/files',async (req,res)=>{
    try{
        const folder= req.query.name
        const fileTree= await generateFileTree(dirPath+'/playground/'+folder)
        return res.send({tree: fileTree})
    }catch(error){
        return res.status(500).send({message:error.message})
    }
})
app.get("/file/data",async(req,res)=>{
    try{
        const path=req.query.path
        const fileData= await fs.readFile(dirPath+"/playground"+path,'utf8')
        return res.status(200).json({fileContent:fileData})
    }catch(error){
        return res.status(500).send({message:error.message})
    }
})
app.get('/download', (req, res) => {
    try{
        const filePath = path.join(__dirname, 'playground', req.query.file); // Adjust the path as needed
        
        res.download(filePath, (err) => {
            if (err) {
                console.error("File download error:", err);
                res.status(500).send("Error downloading file.");
            }
        });
    }catch(error){
        res.status(500).send({message:error.message})
    }
});

app.get("/codespace",async(req,res)=>{
    try{
        const repos= await fs.readdir(dirPath+'/codespaces')
        const userFolder= await fs.readdir(dirPath+"/playground")
        return res.status(200).send({repos:repos,userFolder:userFolder})
    }catch(error){
        return res.status(500).send({message: error.message})
    }
})
app.post("/replcreate",(req,res)=>{
    try{
       const {projectName,language}= req.body
       ptyProcess.write(`cp -r ${dirPath}/codespaces/${language} ${dirPath}/playground/'${projectName}'\r`)
       return res.status(200).send({message:"Repl created successfully."})
    }catch(error){
        return  res.status(500).send({message:error.message})
    }
})
app.get("/repldelete",(req,res)=>{
    try{
        const folder= req.query.folder
        ptyProcess.write(`rm -r ${dirPath}/playground/'${folder}'\r`)
        return res.status(200).send({message:"Repl deleted successfully."})
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