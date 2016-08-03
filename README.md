# twilio-chat

SMS chat for twilio.

![screenshot](http://i.imgur.com/DWuJejZ.png)

## Usage
Currently split into [client](client) and [server](server) modules, though it probably
makes sense to have server serve client. In the meantime, you'll have to
setup and run both.

### Server
Inside the [server](server) directory:

1. Install dependencies via `npm install`
2. Copy `.env.sample` to `.env` and fill in twilio credentials
3. Run the server using `npm start`

### Client
Inside the [client](client) directory:

1. Install dependencies via `npm install`
2. Run a development server using `npm start`
3. Access it at the address displayed in the terminal
