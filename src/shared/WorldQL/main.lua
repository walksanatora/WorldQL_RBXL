local WQL = {} --create api table
local httpService = game:GetService('HttpService')


function WQL.createNew(URL,autoConnect,listenTimer)
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

    function ret.on(event,cb)
        
    end

    function ret.once(event,cb)

    end

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

    local function fireEvent(event,args)
        local k = getTableKeys(Event_on)
        local k2 = getTableKeys(Event_once)
        if tableContains(k,event) then
            for key, value in pairs(Event_on[event]) do
                value()
            end
        end
        if tableContains(k2,event) then
            for key, value in pairs(Event_once[event]) do
                value()
            end
            Event_once[event] = {}
        end
    end

    local UUID = httpService:GenerateGUID(false)
    local WSAPI =  require(game:GetService('ReplicatedStorage').websockets_lib.WebSocket)
    local connected = false
    
    WSAPI.onopen = function()
        print('connected WebSocket')
        connected = true
        fireEvent('ready')
    end
    WSAPI.onclose = function()
        print('closed WebSocket')
        connected = false
        fireEvent('disconnect')
    end

    return ret
end

return WQL