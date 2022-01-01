const WebSocket = require('ws')
const express = require('express')
const flatbuffers = require('flatbuffers')
const json = require('JSON')

print = console.log

const wqlfb = require('./WQLFB.js').WorldqlFb
const flatBuilder = new flatbuffers.Builder(1024)

const app = express()
const port = process.env.PORT || 2030

const WSMirror = new WebSocket('ws://10.0.0.148:8080')

WSMirror.on('message',msg=>{
    var dec = new Uint8Array(msg)
    var buf = new flatbuffers.ByteBuffer(dec)
    var decoded = wqlfb.Messages.Message.getRootAsMessage(buf)
    var o = decoded.unpack()
    console.log(`flatbuffer: ${json.stringify(o)}`)
})

app.get('/',(req,res) =>{
    res.send({
        'failed': true,
        'message': 'not a real endpoint, try somewhere else'
    })
})

app.get('/WorldQL',(req,res)=>{
    res.send({
        'failed':true,
        'message': 'not a real endpoint, try somewhere else'
    })
})



app.listen(port, () => {
    console.log('Server started on: ' + port);
});