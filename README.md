# enviar

Real-time, multi-user chat interface for SMS / text messages. Imagine a call center where customers can
send a text message to a single number and have a live chat with any agent(s) available.

![screenshot](http://i.imgur.com/PIRyygi.png)

## Installation
You can run enviar entirely on free hosted platforms: [Heroku](https://heroku.com)
for the application and [Cloudant](https://cloudant.com) for the database. But
you may prefer to run it locally or on your own server.

### Account credentials
To use enviar in production, you'll need a [Twilio](http://twilio.com) account
for sending SMS and a [Postmark](http://postmarkapp.com) account for sending
password reset emails. If you're setting enviar up for production, I recommend
creating those ahead of time because you'll need your twilio account's
"Account SID" and "Auth Token", and your postmark account's "server token" as
part of the application install process. If you're not setting up enviar for
production, you can skip this part for now.

### Free hosted installation

#### Database
You can use [Cloudant's](https://cloudant.com) free tier for the database by
setting up an account there. Create a database called `enviar` once you've signed up.

##### Configuring the database
The database needs the right security settings configured, and *at the moment*,
the only way to do that is by running a script. That means you have to do a manual
install of enviar. We'll [make this easier soon](https://github.com/timwis/enviar/issues/93).

1. Clone this repo using `git clone https://github.com/timwis/enviar.git`
2. Install node dependencies via `npm install`
3. Copy `.env.sample` to `.env`
4. Fill in your Cloudant hostname, username, and password in `.env` (the `COUCHDB_` ones)
5. Run `npm run bootstrap`

You should see a response like this
```
{ configure: undefined,
  secure: { enviar: { ok: true } },
  push: { _users: [ [Object] ], enviar: [ [Object] ] } }
```

#### Application
You can run the application on [Heroku's](https://heroku.com) free tier.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

Fill in the parameters from the accounts you've setup, including your Cloudant
account in the `COUCHDB` settings.

You should be able to view your application at `https://<app-name>.herokuapp.com`
and login using your Cloudant credentials.

### Local / self-hosted

#### Database
This application uses CouchDB to store messages. Follow their [install docs](http://docs.couchdb.org/en/1.6.1/install/index.html)
to run CouchDB locally.

By default, CouchDB considers everyone an admin, which is known as "Admin Party."
Disable this by going to the control panel (usually at `http://localhost:5984/_utils`)
and [disabling it](http://i.imgur.com/CNtlaBK.png) (image credit @nolanlawson).
In doing so, you'll create your admin account with a password.

#### Application
1. Clone this repo using `git clone https://github.com/timwis/enviar.git`
2. Install node dependencies via `npm install`
3. Copy `.env.sample` to `.env`
4. Fill in your the `COUCHDB_HOST` in `.env` (ie. `http://localhost:5984`), along
with the `COUCHDB_USER` and `COUCHDB_PASS` you setup. The other variables are only
required in production mode.
5. Configure the database's security settings by running `npm run bootstrap` from
the terminal
6. Enable [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS)
by running `npm run cors` from the terminal

## Usage

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
1. Make sure all the credentials are filled out in `.env`
2. Run the server using `npm start`
3. Point twilio's incoming message webhook to `http://<your-server>/api/inbound` (check out [ngrok](https://ngrok.com/) to expose your localhost)

Access the server at `http://<your-server>:3000` (override port using `PORT` environment variable)
