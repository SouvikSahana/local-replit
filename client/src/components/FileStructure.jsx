import React, { useState } from "react";
import styled from "styled-components";
import { AiOutlineFile, AiOutlineFolder } from "react-icons/ai";
import { DiJavascript1, DiCss3Full, DiHtml5, DiReact, DiPython } from "react-icons/di";
import { IoMdListBox } from "react-icons/io";

import json from "../assets/json.svg"
import txt from "../assets/txt.svg"
import python from "../assets/python.svg"
import yaml from "../assets/yaml.svg"
import js from "../assets/js.svg"
import ts from "../assets/ts.svg"
import jsx from "../assets/jsx.svg"
import html from "../assets/html.svg"
import css from "../assets/css.svg"


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

const File = ({ name ,path,clickFile}) => {
  let split = name.split(".");
  let ext= split[split.length-1]
  return (
    <StyledFile  onClick={()=>clickFile(name,path)}>
      {/* render the extension or fallback to generic file icon  */}
      {FILE_ICONS[ext] || <AiOutlineFile />}
      <span>{name}</span>
    </StyledFile>
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

export default function FileStructure({tree,clickFile,path}) {
  return (
    <div className="App">
      <Tree>
        {tree?.map((content,index)=>{
          if(content?.children){
            let path1= path+"/"+content.name
            return <Tree.Folder name={content.name} key={index} >
              <FileStructure tree={content.children} clickFile={clickFile} path={path1} />
            </Tree.Folder>
          }else{
            let path1=path+"/"+ content.name
            return <Tree.File key={index} name={content.name} path={path1} clickFile={clickFile} />
          }
        })}
      </Tree>
    </div>
  );
}
