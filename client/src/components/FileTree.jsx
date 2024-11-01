import React, { useLayoutEffect } from 'react'
import "./FileTree.css"
import FolderTree, { testData } from 'react-folder-tree';
import 'react-folder-tree/dist/style.css'
import { DiPython } from "react-icons/di";
import FileStructure from "./FileStructure"


const FileTree = ({tree,clickFile}) => {
  return (
    <div className='filesContainer'>
        <div className="file_search">
            <input className='file_search_input' />
        </div>
        <div className="files_folder">
            <FileStructure tree={tree} path="" clickFile={clickFile} />
        </div>
    </div>
  )
}

export default FileTree