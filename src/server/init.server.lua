print('init-server')
local chat = game:GetService('Chat')
local i = Instance.new('Part')
i.Parent = workspace
i.Name = 'WQL_Chat'
local RepStor = game:GetService('ReplicatedStorage')
local WQL = require(RepStor.Common.WorldQL)
local WQL_Types = require(RepStor.Common.WorldQL.DataTypes)

local client = WQL.createNew('http://furry-act.auto.playit.gg:41075',2)
client.on('ready',function()
    print('the client has successfully connected')
    chat.Chatted:Connect(function(part,message,color)
        if color == Enum.ChatColor.Green then
            return
        else
            client.sendGlobalMessage('roblox',WQL_Types.Enum.Replication.ExceptSelf,{
                ['parameter'] = message,
                ['flex'] = 'rblxChat',
            })
        end
    end)
    print('chat event connected')
end)
client.on('disconnect',function()
    print('the client disconnected boo-hoo')
end)
client.on('globalMessage',function(message)
    if message.flex == 'rbxlChat' then
        chat:Chat(i,message.parameter,Enum.ChatColor.Green)
    end
end)
client.connect()
