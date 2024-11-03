import React, { useEffect,useRef, useState } from 'react'
import {Terminal as XTerminal} from "@xterm/xterm"
import "@xterm/xterm/css/xterm.css"
import {socket} from "../config/socket"

const Terminal = () => {
    const terminalRef= useRef()

    useEffect(()=>{
        const term= new XTerminal({
            rows:15,
            cursorBlink: true,
            macOptionIsMeta: true,
            
        })
        term.open(terminalRef.current)
        
        term.write('terminal $ ')
        term.onData(data=>{
            socket.emit("terminal:write-folder",data)
        })
        socket.on('terminal:data-folder',(data)=>{
            term.write(data)
        })

        return ()=>{
            socket.off('terminal:data-folder')
        }

    },[])
  return (
    <div id='terminal' ref={terminalRef} />
  )
}

export default Terminal