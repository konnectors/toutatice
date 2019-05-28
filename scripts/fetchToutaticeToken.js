/*eslint no-console: 0 */
const http = require('http')
const url = require('url')
const open = require('open')
const fetch = require('isomorphic-fetch')
const fs = require('fs')
const get = require('lodash/get')
const randomstring = require('randomstring')

const { TOUTATICE_API_URL } = require('../src/constants')
const AUTH_PATH = '/idp/profile/oidc/authorize'
const TOKEN_PATH = '/idp/profile/oidc/token'
const KONNECTOR_DEV_CONFIG_FILE = 'konnector-dev-config.json'

const getOAuthCode = (oauthURL, state) =>
  new Promise((resolve, reject) => {
    const server = http
      .createServer((req, res) => {
        const requestURL = url.parse(req.url, true)

        res.setHeader('Content-Type', 'text/html')
        res.end('You can now close this tab.<script>window.close()</script>')
        server.close()

        const returnState = requestURL.query.state
        if (returnState === state) resolve(requestURL.query.code)
        else reject('Invalid state')
      })
      .listen(8080)

    open(oauthURL, {
      background: true
    })
  })

const run = async () => {
  try {
    if (!process.argv[2]) {
      throw new Error(
        'Please provide the Toutatice client secret to use, ie. `yarn token TheSecret`'
      )
    }
    const manifest = JSON.parse(fs.readFileSync('./manifest.konnector'))
    const scopes = get(manifest, 'oauth.scope.0', '').split('+')

    const clientId = 'myToutaticeCloudClientOIDC'
    const clientSecret = process.argv[2]
    const redirectURI = 'http://cozy.tools:8080/accounts/toutatice/redirect' // The redirectURI must have been whitelisted by the API server, and this one is. If you wish to use another host or port for the local server, the new URL will need to be whitelisted.
    const state = randomstring.generate(14)

    console.log('Getting OAuth code…')
    const oauthUrl = url.parse(TOUTATICE_API_URL + AUTH_PATH)
    oauthUrl.query = {
      client_id: clientId,
      redirect_uri: redirectURI,
      response_type: 'code',
      scope: scopes.join(' '),
      state: state
    }
    const code = await getOAuthCode(url.format(oauthUrl), state)

    console.log('Getting Access Token…')
    const tokenURL = url.parse(TOUTATICE_API_URL + TOKEN_PATH)
    tokenURL.query = {
      code,
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectURI
    }

    const tokenResponse = await fetch(url.format(tokenURL), {
      method: 'POST'
    })
    const tokenData = await tokenResponse.json()

    console.log(`Updating ${KONNECTOR_DEV_CONFIG_FILE}…`)
    const previousConfigFileContent = require(`../${KONNECTOR_DEV_CONFIG_FILE}`)

    fs.writeFileSync(
      `../${KONNECTOR_DEV_CONFIG_FILE}`,
      JSON.stringify(
        {
          ...previousConfigFileContent,
          fields: {
            access_token: tokenData.access_token
          }
        },
        null,
        2
      )
    )

    console.log('✅ All done, your access token has been written.')
  } catch (err) {
    console.warn(`❌ Error: ${err}`)
  } finally {
    process.exit()
  }
}

run()
