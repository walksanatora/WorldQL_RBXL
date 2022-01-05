import WLog from './WALLogger.js'
import colors from 'colors'

import util from 'node:util'

const incomingToProxy = new WLog.LogFormatter({
    'formatShort': (...v)=>{
        return util.format('->'.grey + ' (%d)'.brightBlue + ' incoming ' + '%s'.green,...v)
    },
    'formatLong': (...v)=>{
        return util.format('->'.grey + ' (%d)'.brightBlue + ' message incoming for ' + '%s'.green,...v)
    }
})

const outgoingFromProxy = new WLog.LogFormatter({
    'formatShort': (...v)=>{
        return util.format('<-'.grey + ' (%d)'.brightBlue + ' outgoing ' + '%s'.green,...v)
    },
    'formatLong': (...v)=>{
        return util.format('<-'.grey + ' (%d)'.brightBlue + ' message outgoing from ' + '%s'.green,...v)
    }
})

const incomingToClient = new WLog.LogFormatter({
    'formatShort': (...v)=>{
        return util.format('=>'.green + ' (%d)'.brightBlue +  ' %d'.blue + ' messages to ' + '%s'.green,...v)
    },
    'formatLong': (...v)=>{
        return util.format('=>'.green + ' (%d)'.brightBlue + ' %d'.blue + ' messages being sent to ' + '%s'.green,...v)
    }
})

const outgoingFromClient = new WLog.LogFormatter({
    'formatShort': (...v)=>{
        return util.format('<-'.green + ' (%d)'.brightBlue + ' message from '+ '%s'.green,...v)
    },
    'formatLong': (...v)=>{
        return util.format('<-'.green + ' (%d)'.brightBlue + ' message outgoing from ' + '%s'.green,...v)
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
        return util.format('Client Connect\nUUID: ' + '%s'.green + '\nKey: ' + '%s'.green,ths[1],ths[0])
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
        return util.format('Client Disconnect\nUUID: ' + '%s'.green + '\nKey: ' + '%s'.green,ths[1],ths[0])
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
        return util.format('Client Disconnect (Timeout)\nUUID: ' + '%s'.green + '\nKey: ' + '%s'.green,ths[1],ths[0])
    }
})

const logger = new WLog.Logger({
    //'File':'tmp.log.json',
    'DefaultMessages': {
        'incomingToProxy': incomingToProxy,
        'outgoingFromProxy': outgoingFromProxy,
        'incomingToClient': incomingToClient,
        'outgoingFromClient': outgoingFromClient,
        'connectionJoin': connectionJoin,
        'connectionLeave': connectionLeave,
        'connectionLeaveTimeout': connectionLeaveTimeout
    },
    'useLong': true
})

if (process.env.DEBUG){
logger.startREPL()
logger.logMessage('incomingToProxy',['UUID_HERE'],'InsertMessageObjectHere')
logger.logMessage('outgoingFromProxy',['UUID_HERE'],'InsertMessageObjectHere')
logger.logMessage('incomingToClient',[5,'UUID_HERE'],'InsertMessageObjectsHere')
logger.logMessage('outgoingFromClient',['UUID_HERE'],'InsertMessageObjectHere')
logger.logMessage('connectionJoin',['PEER_UUID_HERE'],['UUID','KEY'])
logger.logMessage('connectionLeave',['PEER_UUID_HERE'],['UUID','KEY'])
logger.logMessage('connectionLeaveTimeout',['PEER_UUID_HERE'],['UUID','KEY'])
console.log('\n***Seperation***\n'.bold)
for (let index = 0; index < logger._Messages.length; index++) {console.log(logger.inspectMessage(index) + '\n')}
}

export default logger