

const socket = io()

//Elements
const SendMessagebtn = document.querySelector("#SendMesssage");
const SendMessageInput = document.querySelector('#TheMessage');
const SendLocationBtn =  document.querySelector("#send-location")
const messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;


//Options
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true})
//querystring library takes the url and parses in the form of an object 
//use location.search to obtain the string after the ? in the url
//also ignore the question mark
const autoscroll = () => {
   //new message element
   const newMessage = messages.lastElementChild;

   //height of new message
   //get all style values of newmessage
   const newMessageStyles = getComputedStyle(newMessage);
   //convert to int from string
   const newMessageMargin = parseInt(newMessageStyles.marginBottom)
   //add the margin of the message to the height of the message
   const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

   //The visible height
   const visibleHeight = messages.offsetHeight

   //Height of messages container
   const containerHeight = messages.scrollHeight

   //how far have i scrolled??,scrolltop returns amount of distance scrolled from top of screen to toppart of scrollbar
   //what we want is distance from top of the screen to the bottom of the scrollbar,no scrollbottom
   //so add the height of visible messages
   const scrollOffset = messages.scrollTop + visibleHeight

   if(containerHeight-newMessageHeight===scrollOffset)
   {
       //scroll all the way to the bottom,if user was already at the bottom before 
       //a new message appeared
       messages.scrollTop = messages.scrollHeight
   }

}
//function to autoscroll when user types in the message but dosent when he is actually viewing
//an older message

//listen instances
socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend',html);
    autoscroll();
})

socket.on('messageLocation',(url)=>{
    console.log(url);
    const html = Mustache.render(locationTemplate,{
        username:url.username,
        url:url.url,
        createdAt:moment(url.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend',html);
    autoscroll();
})

socket.on('roomData',({room,users})=>{
  const html = Mustache.render(sidebarTemplate,{
      room,
      users
  })
  document.querySelector("#sidebar").innerHTML = html
})

//emit instances
SendMessagebtn.addEventListener('click',(e)=>{
     //prevent page refresh
     e.preventDefault();
     //disables btn till message delivered
     SendMessagebtn.setAttribute('disabled','disabled')
     const message = SendMessageInput.value;
     socket.emit('sendMessage',message,(error)=>{
         SendMessagebtn.removeAttribute('disabled');
         SendMessageInput.value=""
         //divert the typing cursor back to the typing field
         SendMessageInput.focus()
         if(error)
         {
             return console.log(error);
         }
         console.log("Message delivered!!")
     });
     //callback function provided
})

SendLocationBtn.addEventListener('click',()=>{
    //if browser dosent support geolocation api
    if(!navigator.geolocation)
    {
      return alert("Geolocation is not supported by your browser.")
    }
    SendLocationBtn.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
       SendLocationBtn.removeAttribute('disabled')
        const pos ={
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        }
        socket.emit('sendLocation',pos,(message)=>{
            console.log(message)
        })
    })
   
})

socket.emit('join',{username,room},(error)=>{
  if(error)
  {
      alert(error);
      location.href = '/'
  }
})

