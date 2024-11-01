import React,{useEffect, useState} from 'react'
import Terminal from './components/Terminal'
import "./App.css"
import FileTree from './components/FileTree'
import { socket } from './socket'
import CodeEditor from './components/CodeEditor'

const App = () => {
  const [fileTree,setFileTree]= useState([])
  const [selectedFile,setSelectedFile]= useState({})

  const getFileTree=async()=>{
    try{
      const response= await fetch('http://localhost:5000/files')
      const result = await response.json()
      setFileTree(result.tree)
    }catch(error){
      console.log(error.message)
    }
  }
  useEffect(()=>{
    getFileTree()
  },[])
  useEffect(()=>{
    socket.on('file:refresh',getFileTree)
    return()=>{
      socket.off('file:refresh',getFileTree)
    }
  },[])
  const clickFile=(name,path)=>{
    let filePath=""
    // let folder= fileTree
    // for(const i of path){
    //   filePath+= "/"+folder[i].name
    //   folder=folder[i].children
    // }
    setSelectedFile({name:name,path:path})
  }
  return (
    <div className='playground-container'>
      <div className="editor_header">
          <div className="project_name">First Python Project</div>
          <button>Run</button>
          <div className="project_health">Health</div>
      </div>

      <div className="editor-container">
          <div className="files">
                <FileTree tree={fileTree} clickFile={clickFile}/>
          </div>
          <div className="editor">
            <div className='editor_file_header_name'>
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

export default App