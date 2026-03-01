import express from "express";
import Thread from "../models/Threads";
const router = express.Router();

router.post("/test", async(req, res) => {
    try{
         const thread=new Thread({
            threadID:"123456",
            title:"Test Thread",
         });

         const response= await thread.save();
         res.send(response);

    }catch(err){
        console.log(err);
        res.status(500).json({error:"Failed to create thread"});
    }
});
