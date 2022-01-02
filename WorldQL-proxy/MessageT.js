export class MessageT {
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
    }
}
