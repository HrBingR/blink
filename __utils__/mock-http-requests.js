const nock = require('nock')

nock.disableNetConnect()
nock.enableNetConnect('127.0.0.1')

// Mock HTTP timeouts
;['https://timeout.com', 'www.timeout.com'].forEach(url => {
  nock(url).get('/').delay(1000000).reply(200, '<html></html>').persist()
})

// For a couple of "stock" websites, prevent actually hitting them
;[
  'https://nodejs.org',
  'https://google.com',
  'https://example.com',
  'https://js.org',
  'https://redirect-test.com'
].forEach(url => {
  nock(url)
    .get('/')
    .reply(
      200,
      `<!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>Some Title</title>
          <meta name="description" content="Some Description">
          <meta name="author" content="Some Author">
        </head>
        <body>
          <p>Hello!</p>
        </body>
      </html>`
    )
    .persist()
})
