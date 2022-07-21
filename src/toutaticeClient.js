const fetch = require('node-fetch').default
const { log } = require('cozy-konnector-libs')

class ToutaticeClient {
  constructor({ url, token }) {
    this.url = url
    this.token = token
  }

  async getUserInfo() {
    const response = await fetch(`${this.url}/idp/profile/oidc/userinfo`, {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    })
    const infos = await response.json()
    return infos
  }

  async getContacts(uuid) {
    const response = await fetch(
      `${this.url}/contacts/${encodeURIComponent(uuid)}`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      }
    )
    if (response.status === 200) return response.json()
    else return null
  }

  async getApps() {
    const response = await fetch(
      'https://partenaires.ipanema.education.fr/safran/api/v1/catalogues/3ec0316e-2cbc-4a7e-ba0d-81e127d98600/sync',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: '{}'
      }
    )
    if (response.status === 202) {
      log('info', 'Syncing apps, returning new list on next API call')
    }
    if (response.status !== 202) {
      log(
        'warn',
        'Something went wrong when syncing apps, returning last state of the list on next API call'
      )
    }
    // the /sync path is async but should be done relatively quickly
    // it has been agreed just to be safe to wait for a second before making the next call
    await this.sleep(1000)

    const syncApps = await fetch(
      'https://partenaires.ipanema.education.fr/safran/api/v1/catalogues/3ec0316e-2cbc-4a7e-ba0d-81e127d98600/applications',
      {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      }
    )
    const jsonApps = await syncApps.json()
    log('info', 'getApps ends')

    return jsonApps
  }

  async sleep(delay) {
    return new Promise(resolve => setTimeout(resolve, delay))
  }
}

module.exports = ToutaticeClient
