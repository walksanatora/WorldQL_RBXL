local DataTypes = {}

local Vec3T = {
    ['x'] = 0, --number
    ['y'] = 0, --number
    ['z'] = 0  --number
}
DataTypes.Vec3 = Vec3T

local RecordT = {
    ['uuid'] = '',        --string
    ['position'] = Vec3T, --Vec3
    ['worldName'] = '',   --string
    ['data'] = '',        --string
    ['flex'] = '',        --string
}
DataTypes.Record = RecordT

local MessageT = {
    ['instruction'] = 0,  --enum.Instruction
    ['parameter'] = '',   --string
    ['senderUUID'] = '',  --string
    ['worldName'] = '',   --string
    ['replication'] = 0,  --enum.Replication
    ['records'] = {},     --table[RecordT]
    ['entities'] = {},    --table[EntityT]
    ['position'] = Vec3T, --Vec3
    ['flex'] = ''         --string
}
DataTypes.Message = MessageT

local EntityT = {
    ['uuid'] = '',        --string
    ['position'] = Vec3T, --Vec3
    ['worldName'] = '',   --string
    ['data'] = '',        --string
    ['flex'] = ''         --string
}
DataTypes.Entity = EntityT

DataTypes.Enum = {}
local Instruction = {
    ['Heartbeat'] = 0,
    ['Handshake'] = 1,
    ['PeerConnect'] = 2,
    ['PeerDisconnect'] = 3,
    ['AreaSubscribe'] = 4,
    ['AreaUnsubscribe'] = 5,
    ['GlobalMessage'] = 6,
    ['LocalMessage'] = 7,
    ['RecordCreate'] = 8,
    ['RecordRead'] = 9,
    ['RecordUpdate'] = 10,
    ['RecordDelete'] = 11,
    ['RecordReply'] = 12,
    ['Unknown'] = 255
}
DataTypes.Enum.Instruction = Instruction

local Replication = {
    ['ExceptSelf'] = 0,
    ['IncludingSelf'] = 1,
    ['OnlySelf']= 2
}
DataTypes.Enum.Replication = Replication


return DataTypes
