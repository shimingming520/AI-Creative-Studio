import WebSocket from "ws";
const ts=await (await fetch("http://127.0.0.1:9223/json/list")).json(); for(const t of ts) console.log(t.type,t.url);