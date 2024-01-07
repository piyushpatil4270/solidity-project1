import express from "express"
import bodyParser from "body-parser"
const app:express.Application = express()
app.use(bodyParser.json())
const port:number = 7000

type Address=string

let balances:{[address:Address]:number}={}
let allowances:{
    [address:Address]:{
        [address:Address]:number
    }
}={}

app.post("/create",(req,res)=>{
 const {userid,initialbalance}=req.body
 if(balances[userid]){
    return res.status(404).send("Account already exists")
 }
 balances[userid]=initialbalance
 res.status(202).send(`Account for User ${userid} created successfully with initial-balance ${initialbalance}`)
})

app.post("/transfer",(req,res)=>{
    const {fromUserid,toUserid,amount}=req.body
    if(!balances[fromUserid] || !balances[toUserid]){
        //console.log(balances)
        return res.status(400).send("Account does not exist")
    }
    if(balances[fromUserid]<amount){
       return res.status(404).send("Insufficient funds in your account")
    }
    //console.log(balances[fromUserid])
    
    balances[fromUserid]-=amount
    balances[toUserid]+=amount
    res.status(202).json(`Transferred ${amount} tokens from ${fromUserid} to ${toUserid} Successfully`)
})

app.post("/balance/:userId",(req,res)=>{
    const balance=balances[req.params.userId]
    if(balance === undefined){
        return res.status(404).send("Account does not exist")
    }
    res.status(202).send(`Balance of Account ${req.params.userId} is ${balance}`)
})

app.post("/approve",(req,res)=>{
   const {ownerId,spenderId,amount}=req.body
   if(!balances[ownerId]){
    return res.status(404).json("Account does not exist")
   }
   if(!allowances[ownerId]){
    allowances[ownerId]={}
   }
   allowances[ownerId][spenderId]=amount
   res.status(202).send(`Account ${ownerId} has approved ${amount} tokens to ${spenderId} on their behalf`)
})

app.post("/transferFrom",(req,res)=>{
   const {fromUserid,toUserid,spenderId,amount}=req.body
   if(!balances[fromUserid] || !balances[toUserid]){
    return res.status(404).json("Account does not exist")
   }
   const allowedAmount=allowances[fromUserid] && allowances[fromUserid][spenderId]
   if(!allowedAmount || allowedAmount<amount){
    return res.status(400).send("Insufficient allowance")
   }
   if(balances[fromUserid]<amount){
    return res.status(408).send("Insufficient funds in senders account")
   }
   balances[fromUserid]-=amount
   balances[toUserid]+=amount
   allowances[fromUserid][spenderId]-=amount
   res.status(202).send(`${spenderId} transferred ${amount} tokens from ${fromUserid} to ${toUserid}`)

})

app.listen(port,()=>{
    console.log(`Server started on port ${port}`)
})