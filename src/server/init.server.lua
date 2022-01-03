print('init-server')
local RepStor = game:GetService('ReplicatedStorage')
local WQL = require(RepStor.common.WorldQL)

local client = WQL.createNew('furry-act.auto.playit.gg:41075',2)