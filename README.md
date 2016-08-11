# enviar

Chat interface for SMS / text messages.

![screenshot](http://i.imgur.com/XMrf0Rd.png)

## Usage
Install dependencies via `npm install`

### Development mode
1. Run the server using `NODE_ENV=development npm start`
2. Access the server at `http://localhost:3000`

You can simulate sending messages using the interface. To simulate receiving a message,
send a `POST` request to `http://localhost:3000/api/inbound`.

Sample inbound `POST` request: (note the `+` in the phone number is encoded as `%2B`)
```bash
curl -X POST -d 'SmsSid=123456&From=%2B12597150948&Body=hello' http://localhost:3000/api/inbound
```

### Production mode
1. Copy `.env.sample` to `.env` and fill in twilio credentials
2. Run the server using `npm start`
3. Point twilio's incoming message webhook to `http://<your-server>/api/inbound` (check out [ngrok](https://ngrok.com/) to expose your localhost)

Access the server at `http://localhost:3000`

Note that there is no authentication built [yet](issues/7), so be careful exposing this publicly.
