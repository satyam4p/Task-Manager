const express = require('express');
const router = new express.Router();
const User = require('../models/users');
const auth = require('../middleware/auth')
const multer = require('multer');
const sharp = require('sharp')
const { sendWelcomeEmail } = require('../email/accounts')


router.post("/users", async (req,res)=>{
    const user = new User(req.body);
    try{
        await user.save()
        sendWelcomeEmail(user.email,user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user,token})
    }catch(error){
        console.log("Error:",error);
        res.status("400").send(error);
    }
});

router.post("/users/login", async (req,res)=>{

    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        //generate toekn for specific user who logs in
        const token = await user.generateAuthToken()
        /* using shorthand syntax to edclare and assign value in object by using { name_of_key_and_value} 
            e.g: {user,token} which equates to { user:user, token:token}*/
        res.send({user,token}) 

    }catch(error){
        res.status(400).send()
    }

})

router.get("/users/me", auth, async (req,res)=>{
    res.send(req.user)
})

router.post("/users/logout", auth, async (req,res)=>{
    try{

        req.user.tokens = req.user.tokens.filter((token)=>{
            /* if tokens are not equal then filter will keep the token in tokens array
             and if equal it will remove the token from tokens array*/
            return token.token !== req.token
        })

        await req.user.save()
        res.send()

    }catch(error){
        res.status(400).send(error)
    }
})

router.use("/users/logoutAll", auth, async (req,res)=>{

    try{

        req.user.tokens = []
        await req.user.save()
        res.send()
    }catch(error){
        res.status(400).send(error)
    }
})


router.patch("/users/me", auth, async (req,res)=>{

    const allowedUpdates = ["name","age","email","password"];
    const updates = Object.keys(req.body);
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update));

    if(!isValidUpdate){
        res.status(400).send({error:"Invalid Update"});
    }
    try{
        // const user = await User.findByIdAndUpdate(req.params.id,req.body,{ new:true, runValidators:true })
        // const user = await User.findById(req.user._id);
        updates.forEach(update=>{
            req.user[update] = req.body[update]
        })
        await req.user.save()
        res.send(req.user);
    }catch(error){
        res.status(400).send(error);
    }
})

router.delete("/users/me", auth, async (req,res)=>{
    try{
        req.user.remove()
        res.send(req.user);
    }catch(error){
        res.status(400).send(error);
    }
    }
    )   

const upload = multer({
    // dest : 'profile', we needed to store the images in db so to get access to image buffer in async method we remove the dest feild in multer
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(png|jpg|jpeg)$/)){
           return cb(new Error("please upload an image"))
        }
        cb(undefined,true);
    }

})

//the last argument in post method is for sending the error for any unhandled error that are thrwon from middlewares
//in following case multer is the middleware which is throwing error
router.post("/users/me/avatar", auth, upload.single('avatar'),async (req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({width : 250, height : 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
},(error, req, res, next)=>{
    res.status(400).send({error: error.message})
})
router.delete("/users/me/avatar", auth, async (req,res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send(200)
})
router.get("/users/:id/avatar",async (req,res)=>{
    const user = await User.findById(req.params.id)
    if(!user){
        return res.status(404)
    }
    res.set('Content-Type','image/png')
    res.send(user.avatar)
})

module.exports = router;


