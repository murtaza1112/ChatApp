                                             #Chat Application
																						 
*ChatApp created using node.js ,socket.io library.

FrontEnd:HTML/CSS,Javascript

BackEnd:Node.js(Socket.io)

*Development deployment Steps:

1.Clone the project.

2.Install node.

3.Install the node package manager(npm).

5.Migrate to the chat-app directory,if not already present.
  cd chat-app
	
6.Install the app, run the command.
   npm run install
	 
6.Run the application.
  npm run dev.
	
8.Application is active on port 3000.
  url:http://localhost:3000/
	
If displaying error:3000 port already in use.
To resolve this ,enter the following command:

  killall -9 node
  
 *Production url:-
 heroku name:murtaza-chat-app
 heroku url:http://murtaza-chat-app.herokuapp.com/
