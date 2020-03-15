const express = require('express');
const path = require('path');
const http = require('http')
const socketio = require('socket.io')

const app = express();
//happens behind the scenes but need it here for socket.io
const server = http.createServer(app);
const io = socketio(server);
//coinfigure the io library with the http server
//which was explicitly called by me

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname,'../public');

app.use(express.static(publicDirectoryPath));
count = 0;
io.on('connection',(socket)=>{
    console.log('new connection');
    //send event to the front end
    socket.emit('countUpdated',count)
    socket.on('increment',()=>{
        count++;
        //difference between the two following is that socket.emit only delivers response to the client who trigerred the event
        //while io.emit sends data to all the clients using the server
        //socket.emit("countUpdated",count);
        io.emit('countUpdated',count)
    })
})

server.listen(port,()=>{
    console.log("The app is active on:",port)
})