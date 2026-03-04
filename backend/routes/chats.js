import express from "express";
import Thread from "../models/Threads.js";
const router = express.Router();

router.post("/test", async(req, res) => {
    try{
         const thread=new Thread({
            threadID:"13579",
            title:"Test Thread new",
         });

         const response= await thread.save();
         res.send(response);

    }catch(err){
        console.log(err);
        res.status(500).json({error:"Failed to create thread"});
    }
});

export default router;