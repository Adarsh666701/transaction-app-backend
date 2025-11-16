const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Account = require('../db/db/Account');    
router.get('/', (req,res)=>{
    res.send("Account route working fine")
})


router.post('/transfer', async (req,res)=>{
    const session = await mongoose.startSession();

    //Start Transaction
    session.startTransaction();

    const {from, to, amount} = req.body;

    const fromAccount = await Account.findOne({
        userId: req.userID
    }).session(session);

    if(!fromAccount || fromAccount.balance < amount){
        await session.abortTransaction();
        res.status(400).json({message: "Insufficient balance"})
    }

    const toAccount = await Account.findOne({
        userId: to
    }).session(session);

    if(!toAccount){
        await session.abortTransaction();
        res.status(400).json({message: "Recipient account not found"})
    }

    //Perform debit and credit
    await Account.updateOne({
        userId:req.userID
    },{
        $inc: {balance: -amount}
    }).session(session);

    await Account.updateOne({
        userId: to
    },{
        $inc:{ balance: amount}
    }).session(session);


    //Commit Transaction
    await session.commitTransaction();

    res.status(200).json({message: "Transfer successful"});
})


module.exports = router;    