import { useState,useDebugValue } from "react"

const useFormFields=(initialState=null)=>{
    const [fields,setFields]=useState(initialState)
    const handleChange=(e)=>{
      const {name,value}=e.target
      setFields({...fields,[name]:value})
    }
    useDebugValue('get input values with handleChange')
    return [fields,handleChange]
}

export default useFormFields