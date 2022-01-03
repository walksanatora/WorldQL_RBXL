class MessageT {
    constructor(instruction = Instruction.Heartbeat, parameter = null, senderUuid = null, worldName = null, replication = Replication.ExceptSelf, records = [], entities = [], position = null, flex = []) {
        this.instruction = instruction;
        this.parameter = parameter;
        this.senderUuid = senderUuid;
        this.worldName = worldName;
        this.replication = replication;
        this.records = records;
        this.entities = entities;
        this.position = position;
        this.flex = flex;
        Object.freeze(this)
    }
}

class Vec3dT {
    constructor(x = 0.0, y = 0.0, z = 0.0) {
        this.x = x;
        this.y = y;
        this.z = z;
        Object.freeze(this)
    }
}

class RecordT {
    constructor(uuid = null, position = null, worldName = null, data = null, flex = []) {
        this.uuid = uuid;
        this.position = position;
        this.worldName = worldName;
        this.data = data;
        this.flex = flex;
        Object.freeze(this)
    }
}

class EntityT {
    constructor(uuid = null, position = null, worldName = null, data = null, flex = []) {
        this.uuid = uuid;
        this.position = position;
        this.worldName = worldName;
        this.data = data;
        this.flex = flex;
        Object.freeze(this)
    }
}

class MessagePayload {
    constructor( parameter = null, records = [], entities = [], flex = []) {
        this.parameter = parameter;
        this.records = records;
        this.entities = entities;
        this.flex = flex;
        Object.freeze(this)
    }
}

const def = {
    MessageT: MessageT,
    Vec3dT: Vec3dT,
    RecordT: RecordT,
    EntityT: EntityT,
    MessagePayload: MessagePayload,
}

export default def
