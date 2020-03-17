const express = require('express');
const path = require('path');
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage,generateLocation}= require('./utils/messages')
const {addUser,removeUser,getUser,getUsersInRoom}=require('./utils/users')
const app = express();
//happens behind the scenes but need it here for socket.io
const server = http.createServer(app);
const io = socketio(server);
//coinfigure the io library with the http server
//which was explicitly called by me

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname,'../public');

app.use(express.static(publicDirectoryPath));
//five methods used primarily to transfer info from server to client
//socket.emit                   :Send message to only the current client
//io.emit                       :send message to all the clients
//socket.broadcast.emit         :send message to all clients but the current one
//.to(room).emit                :send message to all clients in the room
//socket.broadcast.to(room).emit:send message to all clents but the curren one in the room
io.on('connection',(socket)=>{
    console.log('New connection');
    
    //each socket object contains a unique id used for each connection
    socket.on('join',(options,callback)=>{
        const {error,user} = addUser({id:socket.id,...options});
        //used spread operator to spread out the object props
        if(error)
        {
          return callback(error)
        }

        socket.join(user.room);
        socket.emit('message',generateMessage('Admin',`Welcome,${user.username}!!`))
          //broadcast sends to all users except the current user
         socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined`));
         //to let the client know they havejoined successfully
        io.to(user.room).emit('roomData',{
          room:user.room,
          users:getUsersInRoom(user.room)
        })
         callback();

      })

    socket.on('sendMessage',(message,callback)=>{
        const filter = new Filter();
        const user = getUser(socket.id);
        if(filter.isProfane(message))
        {
            return callback("Sorry,profanity is not allowed.")
        }
        io.to(user.room).emit('message',generateMessage(user.username,message))
        callback();
    })

    
    socket.on('sendLocation',(position,callback)=>{
        //share the google link
        const user = getUser(socket.id);
        if(!position)
        {
           calllback("Sorry,the location could not be shared.")
        }
        console.log(user);
       io.to(user.room).emit('messageLocation',generateLocation(user.username,`https://google.com/maps?q=${position.latitude},${position.longitude}`));
       callback("Location shared!");
    })
    //when a particular user disconnects
    socket.on('disconnect',()=>{
        const user  = removeUser(socket.id)
       if(user)
       {
         io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left.`))
         io.to(user.room).emit('roomData',{
          room:user.room,
          users:getUsersInRoom(user.room)
        })
        }
    })
    
})

server.listen(port,()=>{
    console.log("The app is active on:",port)
})