import express from "express"
import * as wql from '@worldql/client'
import * as crypto from 'node:crypto'
import MessageT from './Wql_objects.js'

const app = express()
const port = process.env.PORT || 2030
const WQLWebsocket = process.env['WQL_WEBSOCKET'] || 'ws://10.0.0.148:8080'

const Clients = {}
const UnreadMessages = {}
const LastSeen = {}

function addMessageToUnread(uuid,Message){
    if (UnreadMessages[uuid] == undefined){UnreadMessages[uuid] = []}
    UnreadMessages[uuid].push(Message)
}
function updateLastSeen(key){
    console.log(`updating last seen time for: ${key}`)
    LastSeen[key] = Date.now()
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
    console.log('creating client')
    const WqlClient = new wql.Client({
        url: WQLWebsocket,
        autoconnect: false
    })
    var key = crypto.randomBytes(Math.ceil(36 / 2)).toString('hex').slice(0, 36)
    console.log('key generated')
    WqlClient.on('ready',()=>{
        console.log(`Created New Client
UUID: ${WqlClient.uuid}
key: ${key}`)
        Clients[key] = WqlClient
        updateLastSeen(key)
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
    })
    WqlClient.connect()
})

/*
Deletes a WorldQL client using the key
-> key
<- [null]
*/
app.delete('/WorldQL/Auth',(req,res)=>{
    if (Object.keys(Clients).indexOf(req.headers.key) != -1){
        var WQLC = Clients[req.headers.key]
        console.log(`Disconnecting Client
        UUID: ${WQLC.uuid}
        key: ${req.headers.key}`)
        UnreadMessages[WQLC.uuid] = undefined
        WQLC.disconnect()
        WQLC.removeAllListeners()
        Clients[req.headers.key] = undefined
        LastSeen[req.headers.key] = undefined
        res.send({
            'failed':false,
            'message': 'deleted WorlQL client',
            'output':[]
        })
    }else{
        console.log(`${req.ip} tried to use server key "${req.headers.key}" and failed`)
        console.log(`current Keys are:`)
        console.log(Object.keys(Clients))
        res.send({
            'failed': true,
            'message': 'invalid server key'
        })
    }
})

/*
Gets a Message
-> {key:string,limit?:number(1)}
<- Array<MessageT>
*/
app.get('/WorldQL/Message',(req,res)=>{
    if (Object.keys(Clients).indexOf(req.headers.key) != -1){
        var Wql = Clients[req.headers.key]
        var uuid = Wql.uuid
        if ((UnreadMessages[uuid] == undefined)||(UnreadMessages[uuid] == [])){res.send({
            'failed': true,
            'message': 'no messages to be recieved'
        })}
        updateLastSeen(req.headers.key)
        res.send({
            'failed': false,
            'message': `${req.headers.limit || 1} message(s) recieved`,
            'output': UnreadMessages[uuid].splice(0, req.headers.limit)
        })
    }else{
        res.send({
            'failed':true,
            'message': 'invalid server key'
        })
    }
})

/*
Sends A message to WorldQL
->{
    key:string,
    worldName: string,
    replication?: number,
    global?:boolean(true),
    position?:Vec3dT,
    payload?: MessagePayload
}
<- []
*/
app.post('/WorldQL/Message',(req,res)=>{
    if (Object.keys(Clients).indexOf(req.headers.key) != -1){
        if (req.headers.worldName == undefined){
            res.send({
                'failed': true,
                'message': 'Missing header "worldName"'
            })
            return
        }
        var Wql = Clients[req.headers.key]
        req.headers.global ??= true;
        if (req.headers.global){
            updateLastSeen(req.headers.key)
            Wql.GlobalMessage(
                req.headers.worldName,
                req.headers.replication ?? wql.Replication.ExceptSelf,
                req.headers.payload
            )
            res.send({
                'failed': false,
                'message': 'GlobalMessage sent',
                'output': []
            })
        }else{
            updateLastSeen(req.headers.key)
            Wql.LocalMessage(
                req.headers.worldName,
                req.headers.position,
                req.headers.replication ?? wql.Replication.ExceptSelf,
                req.headers.payload
            )
            res.send({
                'failed': false,
                'message': 'LocalMessage sent',
                'output': []
            })
        }
    }else{
        res.send({
            'failed':true,
            'message': 'invalid server key'
        })
    }
})

/*
Pings to keep you alive *and* gives you the ammount of messages
-> {
    key:string
}
<- {
    messages:number -- the ammount of UnreadMessages you have
}
*/
app.get('/WorldQL/Ping',(req,res)=>{
    if (Object.keys(Clients).indexOf(req.headers.key) != -1){
        console.log(Object.keys(Clients).indexOf(req.headers.key))
        console.log(Object.keys(Clients))
        updateLastSeen(req.headers.key)
        var Wqlc = Clients[req.headers.key]
        var uuid = Wqlc.uuid
        if (UnreadMessages[uuid] == undefined){UnreadMessages[uuid] = []}
        res.send({
            'failed':false,
            'message': 'updated last seen time',
            'output': {
                'messages': UnreadMessages[uuid].length
            }
        })
    }else{
        res.send({
            'failed':true,
            'message': 'invalid server key'
        })
    }
})

setInterval(()=>{
    var object = LastSeen
    for (const key in object) {
        if (Object.hasOwnProperty.call(object, key)) {
            const element = object[key]
            var ourTime = Date.now()
            if ((ourTime - element) >= 20000){
                var WQLC = Clients[key]
                console.log(`Disconnecting Client
UUID: ${WQLC.uuid}
key: ${key}`)
                UnreadMessages[WQLC.uuid] = undefined
                WQLC.disconnect()
                WQLC.removeAllListeners()
                Clients[key] = undefined
                LastSeen[key] = undefined
            }
        }
    }
},2000)
app.listen(port, () => {
    console.log('Server started on: ' + port);
});
