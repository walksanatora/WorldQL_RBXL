print('init-server')
local chat = game:GetService('Chat')
local RepStor = game:GetService('ReplicatedStorage')
local WQL = require(RepStor.Common.WorldQL)
local WQL_Types = require(RepStor.Common.WorldQL.DataTypes)

local client = WQL.createNew('http://furry-act.auto.playit.gg:41075',2)
client.on('ready',function()
    print('the client has successfully connected')
    chat:Connect(function(part,message,color)
        if color == Enum.ChatColor.Green then
            return
        else
            client.sendGlobalMessage('roblox',WQL_Types.Enum.Replication.ExceptSelf,{
                ['parameter'] = message,
                ['flex'] = 'rblxChat',
            })
        end
    end)
end)
client.on('disconnect',function()
    print('the client disconnected boo-hoo')
end)
client.connect()
