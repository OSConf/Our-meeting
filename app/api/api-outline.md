### Front End API 
>Description: Provide methods for developers who will use the api to impliment the app. The API makes it so that when the base application is changed/updated/patched, the end users application will still work. It also packages operations that the end user would not need or want to care about.


###SECTIONS
TOP LEVEL OBJECT
- Whiteboard
  - general whiteboard related functions
- Current User
 functions related to the user who is logged in
Meeting
getMeeting // Get’s a meeting
functions related to overall management of a meeting
Connected Users
functions related to users in the meeting
Admin
functions related to the administration of meetings
Streams
functions related to user media streams
Chat Stream
MediaStream
Video Stream
Audio Stream
User
functions related to management of a user and attached streams
Current User and Connected User should inherit from this
