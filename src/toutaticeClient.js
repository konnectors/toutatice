const fetch = require('node-fetch').default

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
}

module.exports = ToutaticeClient
