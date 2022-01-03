print('init-server')
local RepStor = game:GetService('ReplicatedStorage')
local WQL = require(RepStor.Common.WorldQL)
local WQL_Types = require(RepStor.Common.WorldQL.DataTypes)

local client = WQL.createNew('http://furry-act.auto.playit.gg:41075',2)
client.on('ready',function()
    print('the client has successfully connected')
end)
client.on('disconnect',function()
    print('the client disconnected boo-hoo')
end)
client.on('rawMessage',function(message: WQL_Types.MessageT)
    print('message recieved')
    print(message)
end)
client.connect()
wait(5)
for i = 0, 10, 1 do
    client.sendRawMessage({
        ['instruction'] = WQL_Types.Enum.Instruction.GlobalMessage,
        ['parameter'] = 'Hello From Roblox '..tostring(i)..'/10',
        ['worldName'] = 'ROBLOX',
        ['replication'] = WQL_Types.Enum.Replication.ExceptSelf,
        ['position'] = {
            ['x'] = i,
            ['y'] = i*5,
            ['z'] = i^i
        }
    })
    wait(10)
end