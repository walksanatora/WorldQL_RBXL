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

function WQL.createNew(URL:string,listenTimer:number|nil,listenGETLimit:number|nil)
    --#region local values
    local ret = {}
    local WQLAPIKEY = ''
    local Connected = false
    if listenTimer > 20 then
        error('listenTimer must be less then 20 seconds')
    end
    local options = {
        ['URL'] = URL,
        ['listenTimer'] = listenTimer or 1,
        ['listenGETLimit'] =  listenGETLimit or 5
    }
    local Event_on = {
        ['ready'] = {}, --implemented
        ['peerConnect'] = {}, --implemented
        ['peerDisconnect'] = {}, --implemented
        ['globalMessage'] = {}, --implemented
        ['localMessage'] = {}, --implemented
        ['rawMessage'] = {}, --implemented
        ['disconnect'] = {}, --implemented
        ['recordReply'] = {} --implemented
    }
    local Event_once = {
        ['ready'] = {},
        ['peerConnect'] = {},
        ['peerDisconnect'] = {},
        ['globalMessage'] = {},
        ['localMessage'] = {},
        ['rawMessage'] = {},
        ['disconnect'] = {},
        ['recordReply'] = {}
    }
    --#endregion
    --#region local util functions
    local function fireEvent(event:string,args:{[number] : any})
        local k = getTableKeys(Event_on)
        local k2 = getTableKeys(Event_once)
        --print('firing event:',event,'with args:',args)
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
        Connected = true
        task.spawn(function()
            while task.wait(options.listenTimer) do
                if not Connected then
                    break
                end
                local output = httpService:JSONDecode(httpService:RequestAsync({
                    ['Url'] = options.URL .. '/WorldQL/Ping',
                    ['Method'] ='GET',
                    ['Headers'] = {['key'] =  WQLAPIKEY},
                }).Body)
                if output.failed then
                    error(output.message)
                end
                if output.output.messages >= 1 then
                    local messages = httpService:JSONDecode(httpService:RequestAsync({
                        ['Url'] = options.URL .. '/WorldQL/Message',
                        ['Method'] = 'GET',
                        ['Headers'] = {
                            ['key'] =  WQLAPIKEY,
                            ['limit'] = tostring(options.listenGETLimit)
                        }
                    }).Body)
                    print(messages)
                    for key, value in pairs(messages.output) do
                        print('message',value,'recieved')
                        if value.instruction == DataTypes.Enum.Instruction.GlobalMessage then
                            fireEvent('globalMessage',{value})
                        elseif value.instruction == DataTypes.Enum.Instruction.LocalMessage then
                            fireEvent('localMessage',{value})
                        elseif value.instruction == DataTypes.Enum.Instruction.RecordReply then
                            fireEvent('recordReply',{value})
                        elseif value.instruction == DataTypes.Enum.Instruction.peerConnect then
                            fireEvent('peerConnect',{value})
                        elseif value.instruction == DataTypes.Enum.Instruction.peerDisconnect then
                            fireEvent('peerDisconnect',{value})
                        end
                        fireEvent('rawMessage',{value})
                    end
                end
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
        Connected = false
        fireEvent('disconnect')
    end

    function ret.sendRawMessage(Message:DataTypes.MessageT)
        print('sending message',Message)
        local data = httpService:JSONDecode(httpService:PostAsync(
            options.URL .. '/WorldQL/Message',
            httpService:JSONEncode(Message),
            Enum.HttpContentType.ApplicationJson,
            false,
            {['key'] =  WQLAPIKEY}))
        if data.failed then
            error(data.message)
        end
    end
    function ret.sendGlobalMessage(worldName:string, replication:number|nil, payload:DataTypes.MessagePayload)
        return ret.sendRawMessage({
            ['instruction'] = DataTypes.Enum.Instruction.GlobalMessage,
            ['parameter'] = payload.parameter,
            ['worldName'] = worldName,
            ['replication'] = replication or DataTypes.Enum.Replication.ExceptSelf,
            ['records'] = payload.records,
            ['entities'] = payload.entities,
        })
    end
    function ret.sendLocalMessage(worldName:string,position:DataTypes.Vec3T, replication:number|nil, payload:DataTypes.MessagePayload)
        return ret.sendRawMessage({
            ['instruction'] = DataTypes.Enum.Instruction.LocalMessage,
            ['parameter'] = payload.parameter,
            ['worldName'] = worldName,
            ['position'] = position,
            ['replication'] = replication or DataTypes.Enum.Replication.ExceptSelf,
            ['records'] = payload.records,
            ['entities'] = payload.entities,
        })
    end
    function ret.recordCreate(worldName:string, records: { [number] : DataTypes.RecordT })
        return ret.sendRawMessage({
            ['instruction'] = DataTypes.Enum.Instruction.Instruction.RecordCreate,
            ['worldName'] = worldName,
            ['records'] = records
        })
    end
    function ret.recordDelete(worldName:string, records: { [number] : DataTypes.RecordT })
        return ret.sendRawMessage({
            ['instruction'] = DataTypes.Enum.Instruction.Instruction.RecordDelete,
            ['worldName'] = worldName,
            ['records'] = records
        })
    end
    function ret.recordRead(worldName:string,position:DataTypes.Vec3T)
        return ret.sendRawMessage({
            ['instruction'] = DataTypes.Enum.Instruction.RecordRead,
            ['worldName'] = worldName,
            ['position'] = position
        })
    end
    function ret.areaSubscribe(worldName:string,position:DataTypes.Vec3T)
        return ret.sendRawMessage({
            ['instruction'] = DataTypes.Enum.Instruction.AreaSubscribe,
            ['worldName'] = worldName,
            ['position'] = position
        })
    end
    function ret.areaUnsubscribe(worldName:string,position:DataTypes.Vec3T)
        return ret.sendRawMessage({
            ['instruction'] = DataTypes.Enum.Instruction.AreaUnsubscribe,
            ['worldName'] = worldName,
            ['position'] = position
        })
    end
    --#endregion
    return ret
end

return WQL