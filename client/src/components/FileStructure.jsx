import React, { useState,useRef, useEffect } from "react";
import styled from "styled-components";
import { AiOutlineFile, AiOutlineFolder } from "react-icons/ai";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import "./FileTree.css"
import {socket} from "../config/socket"


import json from "../assets/json.svg"
import txt from "../assets/txt.svg"
import python from "../assets/python.svg"
import yaml from "../assets/yaml.svg"
import js from "../assets/js.svg"
import ts from "../assets/ts.svg"
import jsx from "../assets/jsx.svg"
import html from "../assets/html.svg"
import css from "../assets/css.svg"

import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import SimCardDownloadIcon from '@mui/icons-material/SimCardDownload';
import DeleteIcon from '@mui/icons-material/Delete';

const FILE_ICONS = {
  js: <img src={js} height={15} width={15} />,
  css: <img src={css} height={15} width={15} />,
  html: <img src={html} height={15} width={15} />,
  jsx: <img src={jsx} height={15} width={15} />,
  py: <img src={python} height={15} width={15} />,
  txt: <img src={txt} height={15} width={15} />,
  json: <img src={json} height={15} width={15} />,
  yaml: <img src={yaml} height={15} width={15} />,
  ts: <img src={ts} height={15} width={15} />
};

const StyledTree = styled.div`
  line-height: 1.5;
`;
const StyledFile = styled.div`
  padding-left: 20px;
  display: flex;
  justify-content:space-between;
  align-items: center;
  cursor: pointer;
  span {
    margin-left: 5px;
  }
`;
const StyledFolder = styled.div`
  padding-left: 20px;

  .folder--label {
    display: flex;
    align-items: center;
    span {
      margin-left: 5px;
    }
  }
`;
const Collapsible = styled.div`
  height: ${p => (p.isOpen ? "0" : "auto")};
  overflow: hidden;
`;


const FileOptions=({open,setOpen,path,setIsEdit,folder})=>{
    const divRef = useRef(null);
    const handleClickOutside = (event) => {
        if (divRef.current && !divRef.current.contains(event.target)) {
            setOpen(false);
            // setIsEdit(false)
        }
    };
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    const handleDeleteFile=(e)=>{
      e.preventDefault()
      try{
        socket.emit("terminal:write",`rm -r ./playground/'${folder}'/${path}\r`)
        setOpen(false)
      }catch(error){
        console.log(error.message)
      }
    }
    const handleCopy=(e)=>{
      e.preventDefault()
      try{
        const split=path.split("/")
        const fileName= split.pop()
        const newFile= split.join("/")+"/1_"+fileName
        socket.emit("terminal:write",`cp -r ./playground/'${folder}'/${path} ./playground/'${folder}'/${newFile}\r`)
        setOpen(false)
      }catch(error){
        console.log(error.message)
      }
    }
    const handleDownload=async(e)=>{
      e.preventDefault();
      try{
        const response= await fetch('http://localhost:5000/download?file='+folder+path)
        const blob = await response.blob()
        const url=window.URL.createObjectURL(blob)
        const a = document.createElement('a');
                    a.href = url;
                    a.download =path.split("/").pop()
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url)
        
      }catch(error){
        console.log(error.message)
      }finally{
        setOpen(false)
      }
    }
  return(
    <div ref={divRef} className="px-2 bg-white shadow-xl rounded-lg border-[1px] border-gray-300 absolute    z-50">
      <div onClick={()=>{setIsEdit(true);setOpen(false)}} className="text-xs cursor-pointer p-1 my-2 flex gap-2"> <DriveFileRenameOutlineIcon sx={{fontSize:15}} /> Rename</div>
      <div onClick={handleCopy} className="text-xs cursor-pointer p-1 my-2 flex gap-2"><FileCopyIcon sx={{fontSize:15}}/> Duplicate File</div>
      <div onClick={handleDownload} className="text-xs cursor-pointer p-1 my-2 flex gap-2"><SimCardDownloadIcon sx={{fontSize:15}}/> Download</div>
      <div onClick={handleDeleteFile} className="text-xs cursor-pointer p-1 my-2 border-t-2 flex gap-2"><DeleteIcon sx={{fontSize:15, color:'red'}}/> Delete</div>
    </div>
    )
}
const File = ({ name ,path,clickFile,folder}) => {
  let split = name.split(".");
  let ext= split[split.length-1]
  const [open,setOpen]= useState(false)
  const [isEdit,setIsEdit]= useState(false)

  const spanRef = useRef(null);
  const handleClickOutside = (event) => {
      if (spanRef.current && !spanRef.current.contains(event.target)) {
          setIsEdit(false)
      }
  };
  useEffect(() => {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
          document.removeEventListener('mousedown', handleClickOutside);
      };
  }, []);

  useEffect(() => {
    if (isEdit && spanRef.current) {
        spanRef.current.focus();
        // document.execCommand('selectAll', false, null); // Highlight all text for easy editing
    }
  }, [isEdit])
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); 
        const split=path.split("/")
        split.pop()
        const newPath=split.join("/")+"/"+e.currentTarget.innerText
        socket.emit("terminal:write",`mv ./playground/'${folder}'/${path} ./playground/'${folder}'/${newPath}\r`)
        setIsEdit(false); 
    }
};

  return (
    <div className="flex flex-row ">
    <StyledFile   className="file_styled flex-1  m-[1px]">
      {/* render the extension or fallback to generic file icon  */}
      <div onClick={()=>clickFile(name,path)} className=" flex-1">
        {FILE_ICONS[ext] || <AiOutlineFile />}
        { isEdit? <span contentEditable onKeyDown={handleKeyDown} className="w-[100%]"   ref={spanRef}>{name}</span>:<span >{name}</span>}
      </div>
       
        <MoreVertIcon sx={{height:'16px',width:'15px',color:'gray'}} onClick={()=>setOpen(true)}  className="icon_file"/>
    </StyledFile>
    <div > 
         {open && <FileOptions open={open} setIsEdit={setIsEdit} setOpen={setOpen} path={path} folder={folder}/> }
         </div>
    </div>
  );
};

const Folder = ({ name, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = e => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  return (
    <StyledFolder>
      <div className="folder--label" onClick={handleToggle}>
        <AiOutlineFolder />
        <span>{name}</span>
      </div>
      <Collapsible isOpen={isOpen}>{children}</Collapsible>
    </StyledFolder>
  );
};

const Tree = ({ children }) => {
  return <StyledTree>{children}</StyledTree>;
};

Tree.File = File;
Tree.Folder = Folder;

export default function FileStructure({tree,clickFile,path,folder}) {
  return (
    <div className="App">
  
      <Tree>
        {tree?.map((content,index)=>{
          if(content?.children){
            let path1= path+"/"+content.name
            return <Tree.Folder name={content.name} key={index} >
              <FileStructure tree={content.children} folder={folder} clickFile={clickFile} path={path1} />
            </Tree.Folder>
          }else{
            let path1=path+"/"+ content.name
            return <Tree.File key={index} folder={folder} name={content.name} path={path1} clickFile={clickFile} />
          }
        })}
      </Tree>
    </div>
  );
}
