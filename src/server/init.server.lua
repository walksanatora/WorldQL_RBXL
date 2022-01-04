print('init-server')
local chat = game:GetService('Chat')
local i = Instance.new('Part')
i.Parent = workspace
i.Name = 'WQL_Chat'
local RepStor = game:GetService('ReplicatedStorage')
local WQL = require(RepStor.Common.WorldQL)
local WQL_Types = require(RepStor.Common.WorldQL.DataTypes)

local Chat = game:GetService('Chat')
local Players = game:GetService('Players')

local client = WQL.createNew('http://furry-act.auto.playit.gg:41075',2)
client.on('ready',function()
    print('the client has successfully connected')
    client.areaSubscribe('roblox/chat',{x=0,y=0,z=0})
    Players.PlayerAdded:Connect(function(Player)
        Player.Chatted:Connect(function(message,plr)
            print('chatted')
            client.sendGlobalMessage('roblox/chat',WQL_Types.Enum.Replication.ExceptSelf,{
                ['parameter'] = Chat:FilterStringAsync(message,Player,plr or Player),
                ['flex'] = 'rblxChat',
            })
        end)
        print('binding '..Player.DisplayName..' to chat message linker')
    end)
    
    for i,v in pairs(Players:GetChildren()) do
        v.Chatted:Connect(function(message,plr)
            print('chatted')
            client.sendGlobalMessage('roblox/chat',WQL_Types.Enum.Replication.ExceptSelf,{
                ['parameter'] = Chat:FilterStringAsync(message,v,plr or v),
                ['flex'] = 'rblxChat',
            })
        end)
    end

    print('chat event connected')
end)
client.on('disconnect',function()
    print('the client disconnected boo-hoo')
end)

client.on('globalMessage',function(message)
    if message.worldName == 'roblox/chat' then
        chat:Chat(i,message.parameter,Enum.ChatColor.Green)
    else
        print(message)
    end
end)
client.connect()
