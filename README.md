# enviar

Chat interface for SMS / text messages. **Work in progress**.

![screenshot](http://i.imgur.com/XMrf0Rd.png)

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## Installation
1. Clone this repo using `git clone https://github.com/timwis/enviar.git`
2. Install node dependencies via `npm install`
3. Copy `.env.sample` to `.env`

### CouchDB
This application uses CouchDB to store messages. Follow their [install docs](http://docs.couchdb.org/en/1.6.1/install/index.html)
to run CouchDB locally or setup a free hosted instance with [CloudAnt](https://cloudant.com/).

4. Fill in your the `COUCHDB_HOST` in `.env` (ie. `http://localhost:5984`)
5. By default, couchdb considers everyone an admin. If you have disabled this setting (recommended for production)
and have an admin user setup, fill in its credentials in the `COUCHDB_USER` and `COUCHDB_PASS` variables. Otherwise
continue without these.
6. Configure the database using `npm run bootstrap`. If you're running couchdb locally, also run `npm run cors`.

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
1. Fill in your twilio credentials in `.env`
2. Run the server using `npm start`
3. Point twilio's incoming message webhook to `http://<your-server>/api/inbound` (check out [ngrok](https://ngrok.com/) to expose your localhost)

Access the server at `http://localhost:3000`

## User administration
By default, couchdb considers everyone an admin. If you have disabled this setting (recommended for production)
and have created an admin user, you can use that user to login to enviar. You can also create users that have
`agent`-level access, allowing them to user enviar without admin access. To create `agent` users, use the
command line interface.

To create a user or change a user's password
```bash
npm run user -- <username> <password>
```

To "upgrade" an existing user to have `agent` access, simply omit the password.
```bash
npm run user -- <username>
```

This functionality will eventually be incorporated into the application.
