const getManifestInfos = require('./helpers/getManifestInfos')
const manifestInfos = getManifestInfos()

const APP_NAME = `konnector-${manifestInfos.slug}`
const APP_VERSION = manifestInfos.version

const DOCTYPE_CONTACTS = 'io.cozy.contacts'
const DOCTYPE_CONTACTS_GROUPS = 'io.cozy.contacts.groups'
const DOCTYPE_CONTACTS_ACCOUNT = 'io.cozy.contacts.accounts'
const DOCTYPE_CONTACTS_VERSION = 2
const DOCTYPE_CONTACTS_GROUPS_VERSION = 2
const DOCTYPE_CONTACTS_ACCOUNT_VERSION = 1
const TOUTATICE_API_URL = 'https://partenaires.ipanema.education.fr'

module.exports = {
  APP_NAME,
  APP_VERSION,
  DOCTYPE_CONTACTS,
  DOCTYPE_CONTACTS_ACCOUNT,
  DOCTYPE_CONTACTS_VERSION,
  DOCTYPE_CONTACTS_ACCOUNT_VERSION,
  DOCTYPE_CONTACTS_GROUPS,
  DOCTYPE_CONTACTS_GROUPS_VERSION,
  TOUTATICE_API_URL
}
