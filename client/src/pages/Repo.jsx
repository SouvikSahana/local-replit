import React,{useEffect, useState} from 'react'
import Terminal from '../components/Terminal'
import "../App.css"
import FileTree from '../components/FileTree'
import { socket } from '../config/socket'
import CodeEditor from '../components/CodeEditor'
import {api} from "../config/api"
import { Button } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const Repo = () => {
  const [fileTree,setFileTree]= useState([])
  const [selectedFile,setSelectedFile]= useState({})
  const [folder,setFolder]= useState("")

  const getFileTree=async()=>{
    try{
      const url= new URL(window.location)
      const folderName= url.searchParams.get('name')
      setFolder(folderName)
      const response= await api.get("/files?name="+folderName)
      const result = await response.data
      setFileTree(result.tree)
    }catch(error){
      console.log(error.message)
    }
  }
  useEffect(()=>{
    const url= new URL(window.location)
    const folderName= url.searchParams.get('name')
    if(folderName){
      socket.emit("terminal:refresh-folder",{path:"/playground/"+folderName})
    }
  },[])
  useEffect(()=>{
    getFileTree()
    console.log("hi")
  },[])
  useEffect(()=>{
    socket.on('file:refresh',getFileTree)
    return()=>{
      socket.off('file:refresh',getFileTree)
    }
  },[])
  const clickFile=(name,path)=>{
    setSelectedFile({name:name,path:`/${folder}${path}`})
  }
  return (
    <div className='playground-container'>
      <div className="editor_header">
          <div className="project_name">{folder}</div>
          <Button variant='contained'><PlayArrowIcon/> Run</Button>
          <Button>Health</Button>
      </div>

      <div className="editor-container">
          <div className="files">
                <FileTree tree={fileTree} folder={folder} clickFile={clickFile}/>
          </div>
          <div className="flex-1 ">
            <div className='bg-[#f2f4f6]  h-[25px] px-[20px] text-orange-400'>
              {selectedFile?.path?.replaceAll("/"," > ")}
            </div>
              <CodeEditor selectedFile={selectedFile}/>
          </div>
      </div>

      <div className='terminal-container'>
       <Terminal />
      </div>
    </div>
  )
}

export default Repo