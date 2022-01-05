import WLog from './WALLogger.js'
import 'colors'

import util from 'node:util'

const incomingToProxy = new WLog.LogFormatter({
    'formatShort': (...v)=>{
        return util.format('->'.grey + ' (%d)'.brightBlue + ' incoming ' + '%s'.green,...v)
    },
    'formatLong': (...v)=>{
        return util.format('->'.grey + ' (%d)'.brightBlue + ' message incoming for ' + '%s'.green,...v)
    },
    'inspect': (ths)=>{
        return util.format('Incomming Message for' + '%s'.green + '\n%s',ths.values[0],util.inspect(ths.extra,{colors:true}))
    }
})

const incomingToClient = new WLog.LogFormatter({
    'formatShort': (...v)=>{
        return util.format('=>'.green + ' (%d)'.brightBlue +  ' %d'.blue + ' messages to ' + '%s'.green,...v)
    },
    'formatLong': (...v)=>{
        return util.format('=>'.green + ' (%d)'.brightBlue + ' %d'.blue + ' messages being sent to ' + '%s'.green,...v)
    },
    'inspect': (ths)=>{
        return util.format('Incomming Messages (%d) for' + '%s'.green + '\n' + '%s',ths.values[0],ths.values[1],util.inspect(ths.extra),{colors:true})
    }
})

const outgoingFromClient = new WLog.LogFormatter({
    'formatShort': (...v)=>{
        return util.format('<-'.green + ' (%d)'.brightBlue + ' message from '+ '%s'.green,...v)
    },
    'formatLong': (...v)=>{
        return util.format('<-'.green + ' (%d)'.brightBlue + ' message outgoing from ' + '%s'.green,...v)
    },
    'inspect': (ths)=>{
        return util.format('Message Sent\n%s',util.inspect(ths.extra,{colors:true}))
    }
})

const connectionJoin = new WLog.LogFormatter({
    'formatShort': (...v)=>{
        return util.format('+'.green.inverse + ' (%d)'.brightBlue + ' User UUID: ' + '%s'.green,...v)
    },
    'formatLong': (...v)=>{
        return util.format('+'.green.inverse + ' (%d)'.brightBlue + ' A User UUID ' + '%s'.green + ' Has Connected',...v)
    },
    'inspect': (ths) =>{
        return util.format('Client Connect\nUUID: ' + '%s'.green + '\nKey: ' + '%s'.green,ths.values[2],ths.values[1])
    }
})

const connectionLeave = new WLog.LogFormatter({
    'formatShort': (...v)=>{
        return util.format('-'.red.inverse + ' (%d)'.brightBlue + ' User UUID: ' + '%s'.green,...v)
    },
    'formatLong': (...v)=>{
        return util.format('-'.red.inverse + ' (%d)'.brightBlue + ' User UUID: ' + '%s'.green + ' Has Disconnected',...v)
    },
    'inspect': (ths) =>{
        return util.format('Client Disconnect\nUUID: ' + '%s'.green + '\nKey: ' + '%s'.green,ths.values[2],ths.values[1])
    }
})

const connectionLeaveTimeout = new WLog.LogFormatter({
    'formatShort': (...v)=>{
        return util.format('-'.red.inverse + ' (%d)'.brightBlue + ' User UUID: ' + '%s'.green,...v)
    },
    'formatLong': (...v)=>{
        return util.format('-'.red.inverse + ' (%d)'.brightBlue + ' User UUID: ' + '%s'.green + ' Has Disconnected (timeout)',...v)
    },
    'inspect': (ths) =>{
        return util.format('Client Disconnect (Timeout)\nUUID: ' + '%s'.green + '\nKey: ' + '%s'.green,ths.values[2],ths[1])
    }
})

const invalidKey = new WLog.LogFormatter({
    'formatShort': (...v)=>{
        return util.format('?'.red.inverse + ' (%d)'.brightBlue + ' Missing/Invalid Key: ' + '%s'.green + ' IP: ' + '%s'.blue,...v)
    },
    'formatLong': (...v) =>{
        return util.format('?'.red.inverse + '(%d)'.brightBlue + ' The Supplied Key: ' + '%s'.green +' Is Invalid and was sent by IP: ' + '%s'.blue,...v)
    },
    'inspect': (ths) =>{
        return util.format('IP: ' + '%s'.blue + ' send a invalid key: ' + '%s'.green + '\nCurrent Keys are: ' + '%s',ths.values[1],ths.values[2],util.inspect(ths.extra,{colors:true}))
    }
})

const genericMessage = new WLog.LogFormatter({
    'formatShort': (...v)=>{
        return util.format('(%d) '.blue,...v)
    },
    'formatLong': (...v)=>{
        return util.format('(%d) '.blue,...v)
    },
    'inspect': (ths) =>{
        return util.format('Generic Message "%s"',ths.values.join(' '))
    }
})

const logger = new WLog.Logger({
    //'File':'tmp.log.json',
    'DefaultMessages': {
        'incomingToProxy': incomingToProxy,
        'incomingToClient': incomingToClient,
        'outgoingFromClient': outgoingFromClient,
        'connectionJoin': connectionJoin,
        'connectionLeave': connectionLeave,
        'connectionLeaveTimeout': connectionLeaveTimeout,
        'invalidKey': invalidKey,
        'genericMessage': genericMessage
    },
    'useLong': true
})

if (process.env.DEBUG){
logger.startREPL()
logger.logMessage('incomingToProxy',['UUID_HERE'],'InsertMessageObjectHere')
logger.logMessage('incomingToClient',[5,'UUID_HERE'],'InsertMessageObjectsHere')
logger.logMessage('outgoingFromClient',['UUID_HERE'],'InsertMessageObjectHere')
logger.logMessage('connectionJoin',['PEER_UUID_HERE'],['UUID','KEY'])
logger.logMessage('connectionLeave',['PEER_UUID_HERE'],['UUID','KEY'])
logger.logMessage('connectionLeaveTimeout',['PEER_UUID_HERE'],['UUID','KEY'])
logger._print('\n***Seperation***\n'.bold)
for (let index = 0; index < logger._Messages.length; index++) {logger._print(logger.inspectMessage(index) + '\n')}
}

export default logger