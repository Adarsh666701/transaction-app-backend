const express = require('express');
const router = express.Router();
const zod = require('zod')
const user = require('../db/db/User');
const jwt = require('jsonwebtoken');



router.get('/', (req,res)=>{
    res.send("User route working fine")
})

const signUpSchena = zod.object({
    firstName: zod.string().min(1,"First name is required"),
    lastName: zod.string().min(1,"Last name is required"),
    email: zod.string().email("Invalid email address"),
    password: zod.string().min(8,"Password must be at least 8 characters long"),
})
router.post('/signUp', async (req,res)=>{
    const body = req.body;
    const {success} = signUpSchena.safeParse(body);
    if(!success){
        return res.status(400).json({message: "Invalid request data"})
    }

    const user = await user.findOne({email:body.email});

    if(user){
        return res.status(400).json({message: "User already exists"})
    }

    const newUser = await new user.create(body);
    newUser.save();

    const userID = newUser._id;
    const token = jwt.sign({
        id: userID,
    }, process.env.JWT_SECRET, {expiresIn: '1h'});

    res.status(201).json({
        message: "User created successfully",
        token,
    });
})

const loginSchema = zod.object({
    email: zod.string().email("Invalid email address"),
    password: zod.string().min(8,"Password must be at least 8 characters long")
})
router.post('/login,', async (req,res)=>{
    const {email, password} = req.body;
    const parseSchema = loginSchema.safeParse(req.body);
    if(!parseSchema.success){
        return res.status(400).json({message: "Invalid request data"})
    }
    const existingUser = await user.findOne({email});
    if(!existingUser){
        return res.status(400).json({message: "User does not exist"})
    }
    if(existingUser.password !== password){
        return res.status(400).json({message: "Invalid password"})
    }

    const token = jwt.sign({
        id:existingUser._id,

    },process.env.JWT_SECRET, {expiresIn: '1h'});
    res.status(200).json({
        message: "Login successful",
        token,
    });
})

const updateBodySchema = zod.object({
    firstName: zod.string().min(1,"First name is required").optional(),
    lastName: zod.string().min(1,"Last name is required").optional(),
    email: zod.string().email("Invalid email address").optional(),
})


router.put('/updateInfo',authMiddleware, async (req,res)=>{
    const body = req.body;
    const {success} = updateBodySchema.safeParse(body);
    if(!success){
        return res.status(411).json({message: "Invalid Body Request"})
    }

    await user.updateOne({id:req.userID}, body);

    res.status(200).json({message: "User info updated successfully"})

})


router.get("/bulk", authMiddleware, async (req,res)=>{

    const filter = req.query.filter || "";
    
    const users = await user.find({
        $or:[
            {
                firstName: {$regex:filter}
            },
            {
                lastName: {$regex:filter}
            }
        ]
    });

    res.status(200).json({
        user: users.map(user=>({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            id: user._id
        }))
    });
})


module.exports = router;
