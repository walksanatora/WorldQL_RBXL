
# Creating a Client
to create a WorldQL client use `WorldQL.createNew`<br>
which takes 3 arguments<br>
`URL` - url to the WorldQL rest proxy ex: `'http://furry-act.auto.playit.gg:41075'`<br>
`listenTimer` - a number for how long between pinging the server, cannot be less then 1 and not greater then 20 (the time limit the server times out) default: 1<br>
`listenGetLimit` - the maximum ammount of messages that can be gotten at once Defaut: 5<br>

after that you get a `client`

# Client
## Functions
`.on(event: string,callback)` - connects a function to a [event](#events)<br>
<br>
`.once(event: string,callback)` - connects a function to a [event](#events) that will only be fired once<br>
<br>
`.connect()` - connects to the WorldQL Proxy so you can actually use the api fires `ready` once connected<br>
<br>
`.disconenct()` - disconnects from the api fires event `disconnect`<br>
<br>
`.sendRawMessage(Message: MessageT)` - sends a message json to WorldQL<br>
<br>
`.sendGlobalMessage(worldName:string, replication:number|nil, payload:MessagePayload)`<br>
inputs:<br>
`worldName` - the world the message is sent in<br>
`replication` - a value from [`DataTypes.Enum.Replication`](src/shared/WorldQL/DataTypes.lua#l81-85) default: 0<br>
`payload` -  the [MessagePayload](src/shared/WorldQL/DataTypes.lua#l53-58)<br>
<br>
`.sendLocalMessage(worldName:string,position:Vec3T, replication:number|nil, payload:MessagePayload)`<br>
inputs:<br>
`worldName` - the world the message is sent in<br>
`position` -  A [Vec3T](src/shared/WorldQL/DataTypes.lua#l5-9) location, can be converted from vector3 using [DataTypes.Converters.Vector3toVec3(V3:Vector3)](src/shared/WorldQL/DataTypes.lua#l12)<br>
`replication` - a value from [`DataTypes.Enum.Replication`](src/shared/WorldQL/DataTypes.lua#l81-85) default: 0<br>
`payload` - the [MessagePayload](src/shared/WorldQL/DataTypes.lua#l53-58)<br>
<br>
`.sendRecordCreate(worldName:string, records: { [number] : DataTypes.RecordT })`<br>
inputs:<br>
`worldName` - the world the message is sent in<br>
`records` - A list/Array of [RecordT](src/shared/WorldQL/DataTypes.lua#l25-31) values<br>
<br>
`.sendRecordDelete(worldName:string, records: { [number] : DataTypes.RecordT })`<br>
inputs:<br>
`worldName` - the world the message is sent in<br>
`records` - A list/Array of [RecordT](src/shared/WorldQL/DataTypes.lua#l25-31) values<br>
<br>
`.sendRecordRead(worldName:string, records: { [number] : DataTypes.RecordT })`<br>
inputs:<br>
`worldName` - the world the message is sent in<br>
`records` - A list/Array of [RecordT](src/shared/WorldQL/DataTypes.lua#l25-31) values<br>
<br>
`.sendAreaSubscribe(worldName:string,position:Vec3T)`<br>
inputs:<br>
`worldName` - the world the message is sent in<br>
`position` -  A [Vec3T](src/shared/WorldQL/DataTypes.lua#l5-9) location<br>
<br>
`.sendAreaUnsubscribe(worldName:string,position:Vec3T)`<br>
inputs:<br>
`worldName` - the world the message is sent in<br>
`position` -  A [Vec3T](src/shared/WorldQL/DataTypes.lua#l5-9) location<br>
<br>
if you dont know what a ceartain message type does read about it [here](https://docs.worldql.com/architecture/instructions)<br>
NOTE: inorder to recieve `GlobalMessage`s in a world you have to be subscribes to some point in the world<br>
## Events
`ready` () - fired once the Client has successfully connected to the Server<br>
`disconnect` () - fired when the client disconnnects from the server<br>
`peerConnect` (MessageT) - fired whenever another client joins<br>
`peerDisconnect` (MessageT) - fired whenever another client leaves<br>
`globalMessage` (MessageT) - fired when a globalMessage is recieved<br>
`localMessage` (MessageT) - fired when a localMessage is recieved<br>
`rawMessage` (MessageT) - fired when *any* message is recieved<br>
`recordReply` (MessageT) - fired as a response to Record operations<br>