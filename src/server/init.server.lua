print('init-server')
local RepStor = game:GetService('ReplicatedStorage')
local WQL = require(RepStor.Common.WorldQL)

local client = WQL.createNew('http://furry-act.auto.playit.gg:41075',2)
client.on('ready',function()
    print('the client has successfully connected')
end)
client.on('disconnect',function()
    print('the client disconnected boo-hoo')
end)
client.connect()
for i = 0, 30, 1 do
    print('waiting '..i..'/30')
    wait(1)
end
client.disconect()