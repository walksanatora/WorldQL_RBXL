local WQL = {} --create api table
local httpService = game:GetService('HttpService')
local DataTypes = require(script.DataTypes)

local function getTableKeys(table:table)
    local keyset = {}
    for k,v in pairs(table) do
        keyset[#keyset + 1] = k
    end
    return keyset
end

local function tableContains(table: table,value: any):boolean
    for k, v in pairs(table) do
        if v == value then
            return true
        end
    end
    return false
end

function WQL.createNew(URL:string,listenTimer:number|nil)
    --#region local values
    local ret = {}
    local WQLAPIKEY = ''
    local UnreadMessages = 0
    if listenTimer > 20 then
        error('listenTimer must be less then 20 seconds')
    end
    local options = {
        ['URL'] = URL,
        ['listenTimer'] = listenTimer or 1
    }
    local Event_on = {
        ['ready'] = {}, --implemented
        ['peerConnect'] = {},
        ['peerDisconnect'] = {},
        ['globalMessage'] = {},
        ['localMessage'] = {},
        ['disconnect'] = {}, --implemented
        ['recordReply'] = {}
    }
    local Event_once = {
        ['ready'] = {},
        ['peerConnect'] = {},
        ['peerDisconnect'] = {},
        ['globalMessage'] = {},
        ['localMessage'] = {},
        ['disconnect'] = {},
        ['recordReply'] = {}
    }
    
    --#endregion
    --#region local util functions
    local function fireEvent(event:string,args:{[number] : any})
        local k = getTableKeys(Event_on)
        local k2 = getTableKeys(Event_once)
        if tableContains(k,event) then
            for key, value in pairs(Event_on[event]) do
                value(unpack(args or {}))
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
    function ret.on(event: string,cb)
        if typeof(cb) ~="function" then error('cb must be a function') end
        local k = getTableKeys(Event_on)
        if tableContains(k,event) then
            table.insert(Event_on[event],cb)
        else
            error('Invalid Event "'..event..'"')
        end
    end

    function ret.once(event: string,cb)
        if typeof(cb) ~="function" then error('cb must be a function') end
        local k = getTableKeys(Event_on)
        if tableContains(k,event) then
            table.insert(Event_on[event],cb)
        else
            error('Invalid Event "'..event..'"')
        end
    end

    function ret.connect()
        local data = httpService:RequestAsync({ --error here
            ['Url'] = options.URL .. '/WorldQL/Auth',
            ['Method'] = 'POST'
        })
        local dataT = httpService:JSONDecode(data.Body)
        if dataT.failed then
            error(dataT.message)
        end
        WQLAPIKEY = dataT.output[2]
        task.spawn(function()
            while task.wait(options.listenTimer) do
                local output = httpService:JSONDecode(httpService:RequestAsync({
                    ['Url'] = options.URL .. '/WorldQL/Ping',
                    ['Method'] ='GET',
                    ['Headers'] = {['key'] =  WQLAPIKEY},
                }).Body)
                if output.failed then
                    error(output.message)
                end
                UnreadMessages = output.output.messages
            end
        end)
        fireEvent('ready')
    end

    function ret.disconnect()
        local out = httpService:JSONDecode(httpService:RequestAsync({
            ['Url'] = options.URL .. '/WorldQL/Auth',
            ['Method'] = 'DELETE',
            ['Headers'] = {['key'] = WQLAPIKEY}
        }).Body)
        if out.failed then error(out.message) end
        fireEvent('disconnect')
    end

    --#endregion
    return ret
end

return WQL