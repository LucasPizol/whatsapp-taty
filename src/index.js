const express = require("express")
const app = express()
const server = require("http").createServer(app);
const qrcode = require("qrcode")
const { Client, RemoteAuth } = require("whatsapp-web.js")
const { MongoStore } = require("wwebjs-mongo")
const mongoose = require("mongoose")
const dotenv = require("dotenv").config()

mongoose.connect(process.env.MONGODB_URI).then(() => {
  const store = new MongoStore({ mongoose })

  const client = new Client({
    authStrategy: new RemoteAuth({
      backupSyncIntervalMs: 60000,
      store,
      dataPath: __dirname + "./config/.wwebjs_auth",

    }),
    puppeteer: {
      args: ['--no-sandbox'],
    },
    webVersionCache: {
      type: "local",
      path: __dirname + "/config/.wwebjs_cache"
    }
  })

  const io = require("socket.io")(server, {
    cors: {
      origin: "*"
    }
  })

  app.set('view engine', "ejs")

  app.get("/home", (req, res) => {
    res.sendFile(__dirname + "/views/index.html")
  })

  server.listen(3001, () => {
    console.log("running")
  })

  io.on("connection", (socket) => {

    socket.emit("qr", "https://i.gifer.com/origin/34/34338d26023e5515f6cc8969aa027bca.gif");

    client.on("qr", (qr) => {
      console.log(qr)
      qrcode.toDataURL(qr, (err, url) => {
        socket.emit("qr", url);
      });
    })

    client.on("ready", () => {
      socket.emit("qr", "https://static.vecteezy.com/system/resources/thumbnails/001/200/261/small/check.png");
    })

    console.log("User connected: " + socket.id)
  })

  client.on("message", (message) => {
    if (message.from === "14155238886@c.us") {
      client.sendMessage(message.from, "Fala tu")
    }
  })

  client.initialize()
})
