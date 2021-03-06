const express = require('express');
const Task = require('../models/tasks');
const router = new express.Router();
const auth = require('../middleware/auth')
const User = require('../models/users')

router.post("/tasks", auth, async (req,res)=>{
    const task = new Task({
        ...req.body,
        owner:req.user._id
    });
    try{
        await task.save();
        res.status(201).send(task);
    }catch(error){
         res.status(400).send(error);
    }
})

//GET /tasks?completed=true/false
//GET /tasks?limit=10&skip=10
//GET /tasks?sortBy = createdAt:desc/asc
router.get("/tasks", auth, async (req,res)=>{

    const match = {}
    const sort = {}
    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }
    if(req.query.sortBy){
        const sortQuery = req.query.sortBy.split(':');
        sort[sortQuery[0]] = sortQuery[1]==='desc' ? -1 : 1
    }
    try{
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
            }).execPopulate()
        const tasks = req.user.tasks
        console.log(tasks);
        res.send(tasks);
    }catch(error){
        res.status(400).send(error);
    }
})

router.get("/tasks/:id", auth, async (req,res)=>{
    const _id = req.params.id;
    try{
        // const task = await Task.findById(_id);
        const task = await Task.findOne({_id, owner:req.user._id})
        
    if(!task){
           return res.status(404).send();
        }
        res.status(200).send(task);
    }catch(error){
         res.status(500).send(error);
    }
})

router.patch("/tasks/:id", auth, async (req,res)=>{
    const updates = Object.keys(req.body);
    const allowedUpdates = ["description","completed"];

    const isValidUpdate = updates.every((update)=>allowedUpdates.includes(update));

    if(!isValidUpdate){
        return res.status(400).send({error:"Invalid Update"});
    }

    try{
        // const task = await Task.findByIdAndUpdate(req.params.id,req.body, { new: true, runValidators:true });
        const task = await Task.findOne({_id:req.params.id, owner:req.user._id})

        updates.forEach(update=>{
            task[update] = req.body[update];
        })
        
        if(!task){
            return res.status(404).send();
        }
        await task.save()
        res.status(200).send(task);
    }catch(error){
        res.status(400).send(error);
    }
})

router.delete("/tasks/:id", auth, async (req,res)=>{
    try{
        // const task = await Task.findByIdAndDelete(req.params.id);
        const task = await Task.findOneAndDelete({_id:req.params.id, owner:req.user._id})
    if(!task){
        return res.status(404).send();
    }
    res.send(task);
    }catch(error){
        res.status(404).send(error);
    }
})

module.exports = router;