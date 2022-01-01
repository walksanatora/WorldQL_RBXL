local WQL = {} --create api table
local httpService = game:GetService('HttpService')


local function getTableKeys(table)
    local keyset = {}
    for k,v in pairs(table) do
        keyset[#keyset + 1] = k
    end
    return keyset
end

local function tableContains(table,value)
    for k, v in pairs(table) do
        if v == value then
            return true
        end
    end
    return false
end

function WQL.createNew(URL,autoConnect,listenTimer)
    --#region local values
    local ret = {}
    local options = {
        ['URL'] = URL,
        ['autoConnect'] = autoConnect or false,
        ['listenTimer'] = listenTimer or 1
    }
    local Event_on = {
        ['ready'] = {},
        ['peerConnect'] = {},
        ['peerDisconnect'] = {},
        ['globalMessage'] = {},
        ['localMessage'] = {},
        ['rawMessage'] = {},
        ['disconect'] = {},
        ['recordReply'] = {}
    }
    local Event_once = {
        ['ready'] = {},
        ['peerConnect'] = {},
        ['peerDisconnect'] = {},
        ['globalMessage'] = {},
        ['localMessage'] = {},
        ['rawMessage'] = {},
        ['disconect'] = {},
        ['recordReply'] = {}
    }
    local UUID = httpService:GenerateGUID(false)
    local WSAPI =  require(game:GetService('ReplicatedStorage').websockets_lib.WebSocket)
    WSAPI.Setup('127.0.0.1','2030',"WorlqlRbxlxNodeBridge")
    
    --#endregion

    --#region local util functions
    local function fireEvent(event,args)
        local k = getTableKeys(Event_on)
        local k2 = getTableKeys(Event_once)
        if tableContains(k,event) then
            for key, value in pairs(Event_on[event]) do
                value(unpack(args))
            end
        end
        if tableContains(k2,event) then
            for key, value in pairs(Event_once[event]) do
                value(unpack(args))
            end
            Event_once[event] = {}
        end
    end
    --#endregion

    --#region WorldQL Functions
    function ret.on(event,cb)
        local k = getTableKeys(Event_on)
        if tableContains(k,event) then
            table.insert(Event_on[event],cb)
        else
            error('Invalid Event "'..event..'"')
        end
    end

    function ret.once(event,cb)
        local k = getTableKeys(Event_on)
        if tableContains(k,event) then
            table.insert(Event_on[event],cb)
        else
            error('Invalid Event "'..event..'"')
        end
    end

    function ret.connect()
        WSAPI.onopen = function()
            print('connected WebSocket')
            fireEvent('ready')
        end
        WSAPI.onclose = function()
            print('closed WebSocket')
            fireEvent('disconnect')
        end
        WSAPI.Connect(options.URL)
        WSAPI.StartListen(options.listenTimer)
    end

    function ret.disconnect()
        WSAPI.disconect()
    end

    function ret.sendRawMessage(message)
        if not WSAPI.IsConnected() then
            error('cannot send messages before client is connected')
        end
    end

    --#endregion

    return ret
end

return WQL