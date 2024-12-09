const { IncomingWebhook } = require('@slack/webhook');

function getRemoteAddress (req) {
  return req.headers['x-forwarded-for'] || req.ip || (req.connection && req.connection.remoteAddress)
}

function createCodeBlock (title, code) {
  code = (typeof code === 'string') ? code.trim() : JSON.stringify(code, null, 2)
  const tripleBackticks = '```'
  return `_${title}_${tripleBackticks}${code}${tripleBackticks}\n`
}

function ExpressSlackWebhookNotifier(webhookUrl, skip = () => false) {
  if (typeof webhookUrl !== 'string') {
    throw new Error('Expected webhookUrl to be a string')
  }

  return async function (err, req, res, next) {
    if (!(err instanceof Error)) {
      // In case a number or other primitive is thrown
      err = new Error(err)
    }

    err.status = err.status || 500

    if (skip(err, req, res)) {
      return next(err)
    }

    const webhook = new IncomingWebhook(webhookUrl);

    const request = {
      method: req.method,
      url: req.url,
      headers: req.headers,
      query: req.query,
      body: req.body || {}
    }

    const attachment = {
      fallback: `${err.name}: ${err.message}`,
      color: (err.status < 500) ? 'warning' : 'danger',
      author_name: req.headers.host,
      title: `${err.name}: ${err.message}`,
      fields: [
        { title: 'Request URL', value: req.url, short: true },
        { title: 'Request Method', value: req.method, short: true },
        { title: 'Status Code', value: err.status, short: true },
        { title: 'Remote Address', value: getRemoteAddress(req), short: true }
      ],
      text: [
        { title: 'Stack', code: err.stack },
        { title: 'Request', code: request }
      ].map(data => createCodeBlock(data.title, data.code)).join(''),
      mrkdwn_in: ['text'],
      footer: 'express-slack-error-logger',
      ts: Math.floor(Date.now() / 1000)
    }

    await webhook.send({attachments: [attachment]});

    next(err)
  }
}

module.exports = ExpressSlackWebhookNotifier