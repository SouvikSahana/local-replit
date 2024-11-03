import React,{useEffect,useState} from 'react'
import {api} from "../config/api"
import Button from '@mui/material/Button';
import { Modal } from '@mui/material';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import {useNavigate} from "react-router-dom"

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { socket } from '../config/socket';

const style = {
    position: 'absolute',
    top: '30%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: 'none',
    boxShadow: 24,
    borderRadius: 3,
    p: 2,
  };
const Home = () => {
    const [repos,setRepos]= useState([])
    const [isOpen,setIsOpen]= useState(false)
    const [userFolders,setUserFolders]= useState([])
    const [projectName,setProjectName]= useState("")
    const [language,setLanguage]= useState("")
    const [creating, setCreating]= useState(false)

    const navigate= useNavigate()

    const loadData=()=>{
        try{
            api.get("/codespace").then((response)=>{
                setUserFolders(response.data.userFolder)
                setRepos(response.data.repos)
            }).catch((error)=>{
                // throw new Error(error.message)
                console.log(error)
            })
        }catch(error){
            console.log(error.message)
        }
    }
    useEffect(()=>{
        loadData()
        socket.emit("terminal:refresh",{path:""})
    },[])

    const capitalizeFirstLetter = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };
    const handleCreateRepl=(e)=>{
        e.preventDefault();
        try{
            if(!projectName){
                alert("Please Enter your project name.")
            }else if(!language){
                alert("Please select Repo template")
            }else{
                if(userFolders.includes(projectName)){
                    alert("Repo already available with this name.")
                }else{
                    setCreating(true)
                    setIsOpen(false)
                    api.post("/replcreate",{
                        projectName: projectName,
                        language: language
                    }).then((response)=>{
                        console.log(response.data)
                        setCreating(false)
                        navigate("/repo?name="+projectName)
                    }).catch((error)=>{
                        setCreating(false)
                        alert(error.message)
                        throw new Error(error.message)
                    })
                }
            }
            
        }catch(error){
            console.log(error.message)
        }
    }
    const handleDelete=(folder)=>{
        try{
            const confirm= window.confirm(`Do you want to delete ${folder}?`)
            if(confirm){
                api.get("/repldelete?folder="+folder).then((response)=>{
                    console.log(response.data.message)
                    setTimeout(()=>{
                        loadData()
                    },1000)
                }).catch((error)=>{
                    console.log(error)
                })
                
            } 
        }catch(error){
            console.log(error.message)
        }
    }
  return (
    <div>
        <div className='flex flex-row gap-2 bg-green-200 mx-auto w-[fit-content] p-2 rounded-lg mt-10'>
            <div className='mt-4 '>
                <Button  variant='contained' onClick={()=>setIsOpen(true)} disabled={creating}>Create Repl</Button>
            </div>
            <div className='border-l-2 p-2 border-white'>
                <div className='font-bold text-blue-600'>Your Repls</div>
                <div className='w-[250px] max-h-[500px] overflow-scroll my-2'>
                    {userFolders?.map((folder,index)=>{
                        return(
                            <div key={index} className='cursor-pointer flex flex-row items-center  bg-purple-200  rounded-lg m-1'>
                                <span onClick={()=>{
                                    // socket.emit('terminal:write',`cd ./playground/'${folder}'\r`);
                                navigate("/repo?name="+folder)}}  className=' flex-1 p-4'>{folder}</span> 
                                <DeleteOutlineIcon sx={{color:'red'}} onClick={()=>handleDelete(folder)}/>
                             </div>
                        )
                    })}
                </div>
            </div>
        </div>
        <div className='absolute w-[100%] h-[50vh] flex justify-center items-center '>
            {creating && <div className='flex flex-row items-center gap-3'>
                <CircularProgress /> 
                Please Wait...Creating Repl for your project...
            </div>}
            
        </div>
        <Modal 
            open={isOpen}
            onClose={()=>setIsOpen(false)}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description">
            <Box sx={style}>
                <div className='m-1 '>
                    <TextField label="Project Name" value={projectName} onChange={(e)=>setProjectName(e.target.value)} fullWidth/>
                    <TextField label="Repl" id='repl' name='repl' value={language} select  fullWidth  sx={{marginTop:2, marginBottom:2}}>
                        {/* <div className='h-[200px] overflow-scroll'> */}
                        {repos?.map((repo,index)=>{
                        return (
                           <MenuItem key={index} onClick={()=>setLanguage(repo)} value={repo}> <div key={index} className='bg-red-200 w-[100%] p-2 rounded-lg cursor-pointer'>
                                {capitalizeFirstLetter(repo.replaceAll("_"," "))}
                            </div>
                            </MenuItem>
                        )
                        })}
                        {/* </div> */}
                    </TextField>
                    <Button variant='contained' onClick={handleCreateRepl} sx={{float:'right'}}>Create Repl</Button>
                </div>
            </Box>
        </Modal>
        
    </div>
  )
}

export default Home