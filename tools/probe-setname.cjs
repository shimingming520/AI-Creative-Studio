"use strict";
const { app } = require("electron");
const path = require("node:path");
console.log("[probe] BEFORE setName:", app.getPath("userData"));
app.setName("YUH Studio");
console.log("[probe] AFTER setName :", app.getPath("userData"));
app.setName("yuh-studio-decompiled");
console.log("[probe] AFTER setName2:", app.getPath("userData"));
app.quit();
