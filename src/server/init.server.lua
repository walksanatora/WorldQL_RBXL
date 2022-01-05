print('init-server')
local chat = game:GetService('Chat')
local RepStor = game:GetService('ReplicatedStorage')
local i = Instance.new('RemoteEvent')
i.Parent = RepStor
i.Name = 'clientMessage'
local WQL = require(RepStor.Common.WorldQL)
local WQL_Types = require(RepStor.Common.WorldQL.DataTypes)

local ChatService = require(game:GetService("ServerScriptService"):WaitForChild("ChatServiceRunner").ChatService)

local function SendToChat(msg)
    i:FireAllClients(msg)
 end

local Chat = game:GetService('Chat')
local Players = game:GetService('Players')

local client = WQL.createNew(unpack(require(script.connection)))
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
    print(message)
    if message.worldName == 'roblox/chat' then
        SendToChat(message.parameter)
    end
end)

client.on('peerConnect',function(message)
    SendToChat('UUID: '..message.parameter..' has connected')
end)

client.on('peerDisconnect',function(message)
    SendToChat('UUID: '..message.parameter..' has disconnected')
end)

client.connect()
