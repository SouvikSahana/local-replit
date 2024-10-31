import React, { useLayoutEffect } from 'react'
import "./FileTree.css"

const FileTreeNode=({fileName,Nodes})=>{
    const isDir= !!Nodes
    return(
        <div style={{marginLeft:'10px'}}>
            {fileName}
            {Nodes && <ul>
                    {Object.keys(Nodes).map(child=>{
                        return(
                            <li key={child}>
                                <FileTreeNode fileName={child} Nodes={Nodes[child]} />
                            </li>
                        )
                    })}
                </ul>}
        </div>
    )
}
const FileTree = ({tree}) => {
  return (
    <div className='filesContainer'>
        <div className="file_search">
            <input className='file_search_input' />
        </div>
        <FileTreeNode fileName="/" Nodes={tree} />
    </div>
  )
}

export default FileTree