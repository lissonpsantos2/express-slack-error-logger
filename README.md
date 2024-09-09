# express-slack-error-logger

> Express error handling middleware for reporting error to Slack

> This package was based on [express-error-slack](https://github.com/chunkai1312/express-error-slack) to solve all the security warnings. I tried to contact the maintainer but the repo seems abandoned.

## Install

```
$ npm install express-slack-error-logger
```

## Usage

```js
const express = require('express')
const expressSlackErrorLogger = require('express-slack-error-logger')

const app = express()

// Route that triggers a error
app.get('/error', function (req, res, next) {
  const err = new Error('Internal Server Error')
  err.status = 500
  next(err)
})

// The middleware has to be the last one
app.use(expressSlackErrorLogger('https://hooks.slack.com/services/TOKEN'))
app.listen(3000)
```

The expressSlackErrorLogger can receive two parameters
- webhookUrl: The webhook url to send the message
- skip: function to be used to specify conditions when the middleware should be skipped
