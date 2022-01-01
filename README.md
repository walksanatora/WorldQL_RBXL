# WorldQL_RBXL
Generated by [Rojo](https://github.com/rojo-rbx/rojo) 6.2.0.

A implementation of the [WorldQL Websocket API](https://docs.worldql.com/) in [Roblox](https://www.roblox.com/) [LUAU](https://luau-lang.org/)


## Getting Started
To build the place from scratch, use:

```bash
rojo build -o "WorldQL_RBXL.rbxlx"
```

Next, open `WorldQL_RBXL.rbxlx` in Roblox Studio and start the Rojo server:

```bash
rojo serve
```

install npm dependicies for Websocket Proxy
```sh
cd rbx-websocket-proxy/node-js
npm i
cd ../..
```

next start the WebSocket Proxy
```node
node ./rbx-websocket-proxy/node-js/index.js
```

next either build/download [WorldQL_Server](https://github.com/WorldQL/worldql_server)<br>
done<br>
now you can test this. I will *probally* host this over ngrok via my raspberry pi 4b soon:tm:

For more help, check out [the Rojo documentation](https://rojo.space/docs).