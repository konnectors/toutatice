jest.mock('node-fetch', () => ({
  __esModule: true, // this property makes it work
  default: jest.fn(() => ({
    status: 200,
    json: jest.fn().mockResolvedValue({
      response: 'ok'
    })
  }))
}))

const ToutaticeClient = require('./toutaticeClient')
const fetch = require('node-fetch').default
const get = require('lodash/get')

const MOCK_URL = 'http://toutatice.test.com'
const MOCK_TOKEN = 'MOCK_TOKEN'

describe('toutatice client', () => {
  let client

  beforeEach(() => {
    client = new ToutaticeClient({
      url: MOCK_URL,
      token: MOCK_TOKEN
    })
    fetch.mockClear()
  })

  it('should fetch user informations', async () => {
    const result = await client.getUserInfo()
    expect(fetch).toHaveBeenCalled()

    const args = fetch.mock.calls[0]
    const url = args[0]
    const options = args[1]
    const authHeader = get(options, 'headers.Authorization')

    expect(url).toMatch(new RegExp(`^${MOCK_URL}`))
    expect(url).toMatch(new RegExp('/idp/profile/oidc/userinfo$'))
    expect(authHeader).toEqual(`Bearer ${MOCK_TOKEN}`)
    expect(result).toEqual({ response: 'ok' })
  })

  it('should fetch remote contacts', async () => {
    const MOCK_UUID = 'my-uuid'
    const result = await client.getContacts(MOCK_UUID)
    expect(fetch).toHaveBeenCalled()

    const args = fetch.mock.calls[0]
    const url = args[0]
    const options = args[1]
    const authHeader = get(options, 'headers.Authorization')

    expect(url).toMatch(new RegExp(`^${MOCK_URL}`))
    expect(url).toMatch(new RegExp(`/contacts/${MOCK_UUID}$`))
    expect(authHeader).toEqual(`Bearer ${MOCK_TOKEN}`)
    expect(result).toEqual({ response: 'ok' })
  })

  it('should handle empty responses when fetching remote contacts', async () => {
    const MOCK_UUID = 'my-uuid'
    const mockResponse = {
      status: 204,
      json: jest.fn().mockRejectedValue('Parse error')
    }
    fetch.mockResolvedValue(mockResponse)
    const result = await client.getContacts(MOCK_UUID)
    expect(result).toEqual(null)
    expect(mockResponse.json).not.toHaveBeenCalled()
  })

  it('should URL encode UUIDs', async () => {
    const MOCK_UUID = 'my/uuid'
    await client.getContacts(MOCK_UUID)
    expect(fetch).toHaveBeenCalled()

    const args = fetch.mock.calls[0]
    const url = args[0]

    expect(url).toMatch(new RegExp(`/contacts/my%2Fuuid$`))
  })
})
