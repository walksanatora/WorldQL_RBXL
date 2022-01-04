import * as wql from '@worldql/client'
import ps from 'prompt-sync'
const prompt = ps()

const wqlc = new wql.Client({
    'url': 'ws://10.0.0.148:8080',
    'autoconnect': false
})

wqlc.on('ready',()=>{
    console.log('ready, enter message')
    wqlc.globalMessage('roblox/chat',wql.Replication.ExceptSelf,{
        parameter: prompt(),
        records: undefined,
        entities: undefined,
        flex: 'flex string'
    })
    console.log('sent')
    setTimeout(()=>{
        console.log('done')
        wqlc.disconnect()
    },5000)
})

wqlc.connect()