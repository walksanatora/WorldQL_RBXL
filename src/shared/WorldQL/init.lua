local WQL = {} --create api table
local MessagingService = game:GetService('MessagingService')
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
    local options = {
        ['URL'] = URL,
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
    local UUID: string = httpService:GenerateGUID(false)
    local WSAPI: table = require(script.WebSocket)
    WSAPI.Setup('127.0.0.1','2030',"WorlqlRbxlxNodeBridge")
    
    --#endregion
    --#region local util functions
    local function fireEvent(event:string,args:{[number] : any})
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
    function ret.on(event: string,cb: function)
        local k = getTableKeys(Event_on)
        if tableContains(k,event) then
            table.insert(Event_on[event],cb)
        else
            error('Invalid Event "'..event..'"')
        end
    end

    function ret.once(event: string,cb: function)
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

    function ret.disconnect(): boolean
        return WSAPI.disconect()
    end

    function ret.sendRawMessage(message: DataTypes.MessageT):boolean | nil
        if not WSAPI.IsConnected() then
            error('cannot send messages before client is connected')
        end
        if message.senderUUID == nil then
            message.senderUUID = UUID
        end
        local serilizedMessage = httpService.JSONEncode(message)
        return WSAPI.Send(serilizedMessage)
    end

    function ret.sendGlobalMessage(
        worldName:string,
        replication:number|nil,
        payload:DataTypes.MessageT|nil
    )
        local Message: DataTypes.MessageT = {
            instruction = DataTypes.Enum.Instruction.GlobalMessage,
            worldName = worldName,
            replication = replication or DataTypes.Enum.Replication.ExceptSelf,
            parameter = payload.parameter or '',
            flex = payload.flex or '',
            records = payload.records or {},
            entities = payload.entities or {}
        }
        ret.sendRawMessage(Message)
    end

    function ret.sendLocalMessage(
        worldName: string,
        position: DataTypes.Vec3T,
        replication: number|nil,
        payload: DataTypes.MessageT|nil
    )
        local Message: DataTypes.MessageT = {
            instruction = DataTypes.Enum.Instruction.LocalMessage,
            worldName = worldName,
            replication = replication or DataTypes.Enum.Replication.ExceptSelf,
            parameter = payload.parameter or '',
            flex = payload.flex or '',
            records = payload.records or {},
            entities = payload.entities or {}
        }
        ret.sendRawMessage(Message)
    end

    function ret.recordCreate(
        worldName: string,
        records: {[number]:DataTypes.RecordT}
    )
        local msg: DataTypes.MessageT = {
            instruction = DataTypes.Enum.Instruction.RecordCreate,
            worldName = worldName,
            records = records
        }
        ret.sendRawMessage(msg)
    end

    function ret.recordRead(
        worldName: string,
        position: DataTypes.Vec3T
    )
        local msg: DataTypes.MessageT = {
            instruction = DataTypes.Enum.Instruction.RecordRead,
            worldName = worldName,
            position = position
        }
        ret.sendRawMessage(msg)
    end

    function ret.recordDelete(
        worldName: string,
        records: {[number]:DataTypes.RecordT}
    )
        local msg: DataTypes.MessageT = {
            instruction = DataTypes.Enum.Instruction.RecordDelete,
            worldName = worldName,
            records = records
        }
        ret.sendRawMessage(msg)
    end

    function ret.areaSubscribe(
        worldName:string,
        position:DataTypes.Vec3T
    )
        local msg: DataTypes.MessageT = {
            instruction = DataTypes.Enum.Instruction.AreaSubscribe,
            worldName = worldName,
            position = position
        }
        ret.sendRawMessage(msg)
    end

    function ret.areaUnsubscribe(
        worldName:string,
        position:DataTypes.Vec3T
    )
        local msg: DataTypes.MessageT = {
            instruction = DataTypes.Enum.Instruction.AreaUnsubscribe,
            worldName = worldName,
            position = position
        }
        ret.sendRawMessage(msg)
    end

    --#endregion
    --#region Internal
    WSAPI.onmessage = function(message:string)
        print('message',message)
    end
    --#endregion
    return ret
end

return WQL