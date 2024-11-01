import React, { useEffect, useState } from 'react'
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";
import { socket } from '../socket';

const CodeEditor = ({selectedFile}) => {
    const [code,setCode]= useState(null)
    const [prevCode,setPrevCode]= useState(null)
    const getFileData=async (path)=>{
        try{
            const response= await fetch('http://localhost:5000/file/data?path='+path)
            const result = await response.json()
            if(result?.message){
                throw new Error(result.message)
            }else{
                setCode(result.fileContent)
                setPrevCode(result.fileContent)
            }
        }catch(error){
            console.log(error)
        }
    }
    useEffect(()=>{
        // console.log(selectedFile)
        if(selectedFile?.path){
            getFileData(selectedFile.path)
        }
    },[selectedFile])


    useEffect(()=>{
        if(code && code!=prevCode){
            const timer= setTimeout(()=>{
                console.log(code)
                socket.emit("file:change",{
                    path: selectedFile.path,
                    content: code
                })
            },5000)
            return ()=>{
                clearTimeout(timer)
            }
        }
    },[code])
  return (
    <div style={{display:'flex',flex:1,flexDirection:'row',height:'100%'}}>
        <AceEditor
                mode="java"
                theme="github"
                onChange={(data)=>setCode(data)}
                value={code}
                name="UNIQUE_ID_OF_DIV"
                // editorProps={{ $blockScrolling: true }}
                // width={"70vw"}
                style={{flex:1,}}
                setOptions={{
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true,
                    enableSnippets: true
                }}
    
        />
    </div>
  )
}

export default CodeEditor