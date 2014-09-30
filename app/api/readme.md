## Front End API 
####Description: 
 >Provide methods for developers who will use the api to impliment the app. The API makes it so that when the base application is changed/updated/patched, the end users application will still work. It also packages operations that the end user would not need or want to care about.

## SECTIONS

### OurMeeting
 > The global object
 
#### Whiteboard 
 > General whiteboard related functions
 
 * insert

   > Inserts input (dom node) into the whiteboard div.
   > Checks to see if the whiteboard contains something, if so puts it back where it belongs.

#### Current User

 > Functions related to the user who is logged in
 
 * joinMeeting
   > Checks to see if current user can join the given meetingID. If so connects them to that meeting.

 * checkInvitations
   > Returns list of all meetings user has been invited to.

 * userName
   > Returns current username.

 * getStreams
   > Returns an object with a parameters with all the streams

 * leaveRoom
 
   > Signals that the user has left the meeting

   > Will close the room if user is last leaving

#### Meeting
 > Functions related to overall management of a meeting
 
 * getRoom
   > Gets a room based off ID.
 * invitedUsers
   > Returns an array of all invited users.
 * connectedUsers
   > Returns array of users currently in the meeting.

#### Chat
 > Functions related to chatting with users in meeting

 * sendMessage
   > Sends a message to the meeting chat stream
 * retreiveMessages
   > Gets all messages from meeting

#### Admin
 > Functions related to the administration of meetings
 
 * createRoom
   > Assigns random room ID and invites input user array to the meeting.
 * openRooms
   > Returns an array of all currently used/open meetings.
 * findUser
   > Takes user id input and returns rooms user is connected to (and invited to).
 * closeRoom
   > Closes the input room.

#### Streams
> Functions related to user media streams

>Streams return their data feed based off user ID

 * Chat Stream
  ##### MediaStream
 > The MediaStream API object

  * Video Stream
  * Audio Stream
 
#### User
> Functions related to management of a user and attached streams

 * name
 * id
 * invites [ ]
 * streams { }
 * Current User and Connected User should inherit from this
 * Something using Object.create(om.user)
