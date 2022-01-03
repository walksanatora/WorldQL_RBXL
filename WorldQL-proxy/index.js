import * as express from "express"
import * as wql from '@worldql/client'
import * as crypto from 'node:crypto'
import * as JSON from 'JSON'

const app = express.express()
app.use(express.json())
const port = process.env.PORT || 2030
const WQLWebsocket = process.env['WQL_WEBSOCKET'] || 'ws://10.0.0.148:8080'

const LoggingClient = new wql.Client({
    url: WQLWebsocket,
    autoconnect: false
})

LoggingClient.on('ready',()=>{
    console.log('wql logger ready')
})

LoggingClient.on('rawMessage',(msg)=>{
    console.log(msg)
})

LoggingClient.connect()

const Clients = {}
const UnreadMessages = {}
const LastSeen = {}

function addMessageToUnread(uuid,Message){
//    console.log(`adding message to uuid: ${uuid}`)
    if (UnreadMessages[uuid] == undefined){UnreadMessages[uuid] = []}
    UnreadMessages[uuid].push(Message)
}
function updateLastSeen(key){
//    console.log(`updating last seen time for: ${key}`)
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
    //console.log('creating client')
    const WqlClient = new wql.Client({
        url: WQLWebsocket,
        autoconnect: false
    })
    var key = crypto.randomBytes(Math.ceil(36 / 2)).toString('hex').slice(0, 36)
    //console.log('key generated')
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
        WqlClient.on('rawMessage',(message)=>{
            addMessageToUnread(WqlClient.uuid,message)
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
        delete UnreadMessages[WQLC.uuid]
        WQLC.disconnect()
        WQLC.removeAllListeners()
        delete Clients[req.headers.key]
        delete LastSeen[req.headers.key]
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
        console.log(`getting ${req.headers.limit ?? 1} messages for key: ${req.headers.key}`)
        var Wql = Clients[req.headers.key]
        var uuid = Wql.uuid
        updateLastSeen(req.headers.key)
        if ((UnreadMessages[uuid] == undefined)||(UnreadMessages[uuid] == [])){res.send({
            'failed': true,
            'message': 'no messages to be recieved'
        })}
        res.send({
            'failed': false,
            'message': `${req.headers.limit ?? 1} message(s) recieved`,
            'output': UnreadMessages[uuid].splice(0, parseInt(req.headers.limit ?? 1))
        })
    }else{
        console.log(`${req.ip} tried to use server key "${req.headers.key}" and failed`)
        console.log(`current Keys are:`)
        console.log(Object.keys(Clients))
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
    message: MessageT
}
<- []
*/
app.post('/WorldQL/Message',(req,res)=>{
    if (Object.keys(Clients).indexOf(req.headers.key) != -1){
        if (req.body == undefined){
            console.log(`${req.headers.key} just forgot to send a request body`)
            console.log(req)
            res.send({
                'failed':true,
                'message': 'missing message data'
            })
            return
        }
        var Wql = Clients[req.headers.key]
        let msg = JSON.parse(req.body)
        Wql.sendRawMessage(msg,msg.replication)
        res.send({
            'failed':false,
            'message': 'message sent',
            'output': []
        })
    }else{
        console.log(`${req.ip} tried to use server key "${req.headers.key}" and failed`)
        console.log(`current Keys are:`)
        console.log(Object.keys(Clients))
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
        updateLastSeen(req.headers.key)
        var Wqlc = Clients[req.headers.key]
        var uuid = Wqlc.uuid
        if (UnreadMessages[uuid] == undefined){UnreadMessages[uuid] = []}
        //console.log(`${req.headers.key} has ${UnreadMessages[uuid].length} UnreadMessages`)
        res.send({
            'failed':false,
            'message': 'updated last seen time',
            'output': {
                'messages': UnreadMessages[uuid].length
            }
        })
    }else{
        console.log(`${req.ip} tried to use server key "${req.headers.key}" and failed`)
        console.log(`current Keys are:`)
        console.log(Object.keys(Clients))
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
                console.log(`Disconnecting Client (timeout)
UUID: ${WQLC.uuid}
key: ${key}`)
                delete UnreadMessages[WQLC.uuid]
                WQLC.disconnect()
                WQLC.removeAllListeners()
                delete Clients[key]
                delete LastSeen[key]
            }
        }
    }
},2000)
app.listen(port, () => {
    console.log('Server started on: ' + port);
});
