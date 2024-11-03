import React, { useLayoutEffect, useState, useEffect, useRef } from 'react'
import "./FileTree.css"
import FolderTree, { testData } from 'react-folder-tree';
import 'react-folder-tree/dist/style.css'
import { DiPython } from "react-icons/di";
import FileStructure from "./FileStructure"
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import {socket} from "../config/socket"


const FileTree = ({tree,folder,clickFile}) => {
  const [isInput,setIsInput]= useState(false)
  const [fileType,setFileType]= useState(null)
  const [name,setName]= useState("")
  const handleCreateFile=(e)=>{
    e.preventDefault()
    try{
      if(fileType=="file" && name){
        socket.emit("terminal:write",`touch playground/'${folder}'/${name}\r`)
      }else if(fileType=="folder" && name){
        socket.emit("terminal:write",`mkdir playground/'${folder}'/${name}\r`)
      }
      setIsInput(false)
      setFileType(null)
      setName("")
    }catch(error){
      console.log(error.message)
    }
  }

  const inputRef = useRef(null);
    const handleClickOutside = (event) => {
        if (inputRef.current && !inputRef.current.contains(event.target)) {
          setIsInput(false)
          setFileType(null)
          setName("")
        }
    };
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

  return (
    <div className='p-[10px] bg-[#EBECED] h-[100%] min-w-[200px] border-box'>
        <div className="file_search">
            <input className='file_search_input' />
        </div>
        <div className="file_creation">
          <div>
            Files
          </div>
          <div className='file_creation_icons'>
              <NoteAddIcon sx={{height:'20px', width:'20px',color:'gray', cursor:'pointer'}} onClick={()=>{setFileType("file");setIsInput(true)}}/>
              <CreateNewFolderIcon sx={{height:'25px', width:'20px',color:'gray', cursor:'pointer'}} onClick={()=>{setFileType("folder");setIsInput(true)}}/>
              <MoreVertIcon sx={{height:'20px', width:'25px',color:'gray', cursor:'pointer'}}/>
          </div>
        </div>
        <div className=" max-h-[50vh] overflow-scroll">
          {isInput && <div className="creation_input" ref={inputRef}>
              <InsertDriveFileIcon sx={{color:'gray',width:'15px',height:'15px'}} />
              <form onSubmit={handleCreateFile}>
                <input type="text" value={name} onChange={(e)=>setName(e.target.value)} />
                </form>
            </div>}

            <FileStructure tree={tree} path="" folder={folder} clickFile={clickFile} />
            
        </div>
    </div>
  )
}

export default FileTree