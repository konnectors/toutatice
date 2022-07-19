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
    // log('info', 'getApps begins')
    // const read = async body => {
    //   log('info', 'Get in read')
    //   let error
    //   body.on('error', err => {
    //     error = err
    //   })

    //   for await (const chunk of body) {
    //     log('info', 'get in read loop')
    //     log('info', JSON.parse(chunk.toString()))
    //   }
    //   log('info', 'read before return')
    //   return new Promise((resolve, reject) => {
    //     body.on('close', () => {
    //       error ? reject(error) : resolve()
    //     })
    //   })
    // }

    // log('info', 'TestgetApps before try')

    // try {
    //   log('info', 'TestgetApps inside try')
    //   const response = await fetch(
    //     'https://partenaires.ipanema.education.fr/safran/api/v1/catalogues/3ec0316e-2cbc-4a7e-ba0d-81e127d98600/sync',
    //     {
    //       method: 'POST',
    //       headers: {
    //         Authorization: `Bearer ${this.token}`,
    //         'Content-Type': 'application/json'
    //       },
    //       body: '{}'
    //     }
    //   )
    //   log('info', 'TestgetApps after call')
    //   const data = await read(response.body)
    //   log('info', { data })
    //   log('info', 'TestgetApps after read')
    // } catch (err) {
    //   log('info', 'TestgetApps inside catch')
    //   log('error', err.stack)
    // }
    // log('info', 'Exiting syncCall')
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
      log('info', 'Syncing apps ...')
      await this.sleep(5000)
      log('info', 'Syncing apps succesfully, returning new list')
    }
    if (response.status !== 202) {
      log(
        'warn',
        'Something went wrong when syncing apps, returning last state of the list'
      )
    }
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
