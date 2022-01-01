local DataTypes = {}
DataTypes.Types = {}
DataTypes.Converters = {}

local Vec3T = {
    ['x'] = 0, --number
    ['y'] = 0, --number
    ['z'] = 0  --number
}
DataTypes.Types.Vec3 = Vec3T

function DataTypes.Converters.Vector3toVec3(V3)
    local Vec3 = {
        ['x'] = V3.X,
        ['y'] = V3.Y,
        ['z'] = V3.Z
    }
    return Vec3
end
function DataTypes.Converters.Vec3toVector3(v3)
    return Vector3.new(v3.x,v3.y,v3.z)
end


local RecordT = {
    ['uuid'] = '',        --string
    ['position'] = Vec3T, --Vec3
    ['worldName'] = '',   --string
    ['data'] = '',        --string
    ['flex'] = '',        --string
}
DataTypes.Types.Record = RecordT

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
DataTypes.Types.Message = MessageT

local EntityT = {
    ['uuid'] = '',        --string
    ['position'] = Vec3T, --Vec3
    ['worldName'] = '',   --string
    ['data'] = '',        --string
    ['flex'] = ''         --string
}
DataTypes.Types.Entity = EntityT

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
