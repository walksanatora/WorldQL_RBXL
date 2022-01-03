import * as wql from '@worldql/client'
import MessagePayload from './Wql_objects.js'
const wqlc = new wql.Client({
    'url': 'ws://10.0.0.148:8080',
    'autoconnect': false
})

wqlc.on('ready',()=>{
    console.log('ready')
    wqlc.globalMessage('@global',wql.Replication.ExceptSelf,{
        parameter: 'parameter string',
        records: undefined,
        entities: undefined,
        flex: 'flex string'
    })
    console.log('done')
    wqlc.disconnect()
})

wqlc.connect()