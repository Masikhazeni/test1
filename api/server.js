import mongoose from "mongoose";
import app, { __dirname } from "./app.js";
import dotenv from 'dotenv';
import { startPolling } from './poller.js';
dotenv.config({path:`${__dirname}/config.env`})


app.listen(process.env.PORT,()=>{
    console.log('server is running')
    startPolling()
})