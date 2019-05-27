const fetch = require('isomorphic-fetch')

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
    const infos = await response.json()
    return infos
  }
}

module.exports = ToutaticeClient
