local RepStor = game:GetService('ReplicatedStorage')
local sGUI = game:GetService('StarterGui')
local event = RepStor:WaitForChild('clientMessage')
event.OnClientEvent:Connect(function(msg)
    sGUI:SetCore("ChatMakeSystemMessage",{Text=msg,Color=Color3.fromRGB(70,70,70)})
end)