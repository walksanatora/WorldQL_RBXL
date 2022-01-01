local DataTypes = {}
DataTypes.Converters = {}

--#region Type Defs
export type Vec3T = {
    x: number,
    y: number,
    z: number
}

--#region to/from Vec3T converters
function DataTypes.Converters.Vector3toVec3(V3)
    local Vec3: Vec3T = {
        x=V3.X,
        y=V3.Y,
        z=V3.Z
    }
    return Vec3
end
function DataTypes.Converters.Vec3toVector3(v3)
    return Vector3.new(v3.x,v3.y,v3.z)
end
--#endregion

export type RecordT = {
    uuid: string,
    position: Vec3T,
    worldName: string,
    data: string,
    flex: string
}

export type EntityT = {
    uuid: string,
    position: Vec3T,
    worldName: string,
    data: string,
    flex: string
}

export type MessageT = {
    instruction: number, --DataTypes.Enum.Instruction
    parameter: string?,
    senderUUID: string?,
    worldName: string,
    replication: number?, --DataTypes.Enum.Replication
    records: { [number] : RecordT }?,
    entities: { [number] : EntityT }?,
    position: Vec3T?,
    flex: string?,
}
--#endregion

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
