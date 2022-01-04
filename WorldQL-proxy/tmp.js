import * as wql from '@worldql/client'
import MessagePayload from './Wql_objects.js'
const wqlc = new wql.Client({
    'url': 'ws://10.0.0.148:8080',
    'autoconnect': false
})

wqlc.on('ready',()=>{
    console.log('ready')
    wqlc.globalMessage('roblox/chat',wql.Replication.ExceptSelf,{
        parameter: 'exampleMessage',
        records: undefined,
        entities: undefined,
        flex: 'flex string'
    })
    setTimeout(()=>{
        console.log('done')
        wqlc.disconnect()
    },5000)
})

wqlc.connect()