import * as wql from '@worldql/client'
import MessagePayload from './Wql_objects.js'
const wqlc = new wql.Client({
    'url': 'ws://10.0.0.148:8080',
    'autoconnect': false
})

wqlc.on('ready',()=>{
    wqlc.globalMessage('@global',wql.Replication.ExceptSelf,new MessagePayload(
        'parameter string',
        undefined,
        undefined,
        'flex string'
    ))
})

wqlc.connect()