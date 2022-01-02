import express from "express"
import * as wql from '@worldql/client'
import * as crypto from 'node:crypto'
import MessageT from './MessageT.js'

const app = express()
const port = process.env.PORT || 2030

const Clients = {}
const UnreadMessages = {}

function addMessageToUnread(uuid,Message){
    if (UnreadMessages[uuid] == undefined){UnreadMessages[uuid] = []}
    UnreadMessages[uuid].push(Message)
}

app.get('/',(req,res) =>{
    res.send({
        'failed': true,
        'message': 'The WorldQL Websocket->REST api is working'
    })
})

app.get('/WorldQL',(req,res)=>{
    res.send({
        'failed':true,
        'message': 'Invalid-Endpoint'
    })
})

/*
Generates a new Auth key and uuid pair
-> null
<- [UUID,Key]
*/
app.post('/WorldQL/Auth',(req,res)=>{
    const WqlClient = new wql.Client({
        url: "ws://10.0.0.148:8080",
        autoconnect: false
    })
    var key = crypto.randomBytes(Math.ceil(36 / 2)).toString('hex').slice(0, len)
    WqlClient.on('ready',()=>{
        console.log(`
        Created New Client
        UUID: ${WqlClient.uuid}
        key: ${key}
        `)
        Clients[key] = WqlClient
        res.send({
        'failed': false,
        'message': 'your uuid and key have been generated',
        'output': [
            WqlClient.uuid,
            key
        ]})
        WqlClient.on('globalMessage',(senderUUID,worldName,MessagePayload)=>{
            var MsgT = new MessageT(
                wql.Instruction.GlobalMessage,
                MessagePayload.parameter,
                senderUUID,
                worldName,
                null,
                MessagePayload.records,
                MessagePayload.entities,
                null,
                MessagePayload.flex
            )
            addMessageToUnread(WqlClient.uuid,MsgT)
        })
        WqlClient.on('localMessage',(senderUUID,worldName,position,MessagePayload)=>{
            var MsgT = new MessageT(
                wql.Instruction.LocalMessage,
                MessagePayload.parameter,
                senderUUID,
                worldName,
                null,
                MessagePayload.records,
                MessagePayload.entities,
                position,
                MessagePayload.flex
            )
            addMessageToUnread(WqlClient.uuid,MsgT)
        })
        WqlClient.on('')
    })
})

/*
Deletes a WorldQL client using the key
-> key
<- [null]
*/
app.delete('/WorldQL/Auth',(req,res)=>{
    if (req.header.key in Object.keys(Clients)){
        var WQLC = Clients[req.header.key]
        console.log(`
        Deleting Client
        UUID: ${WQLC.uuid}
        key: ${key}
        `)
        WQLC.disconnect()
        Clients[req.header.key] = undefined
        res.send({
            'failed':false,
            'message': 'deleted WorlQL client',
            'output':[]
        })
    }else{
        res.send({
            'failed': true,
            'message': 'invalid server key'
        })
    }
})



app.listen(port, () => {
    console.log('Server started on: ' + port);
});
