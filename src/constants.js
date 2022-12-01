const getManifestInfos = require('./helpers/getManifestInfos')
const manifestInfos = getManifestInfos()

module.exports = {
  APP_NAME: `konnector-${manifestInfos.slug}`,
  APP_VERSION: manifestInfos.version,
  DOCTYPE_CONTACTS: 'io.cozy.contacts',
  DOCTYPE_CONTACTS_GROUPS: 'io.cozy.contacts.groups',
  DOCTYPE_CONTACTS_ACCOUNT: 'io.cozy.contacts.accounts',
  DOCTYPE_ACCOUNT: 'io.cozy.accounts',
  DOCTYPE_TRIGGERS: 'io.cozy.triggers',
  DOCTYPE_FILES: 'io.cozy.files',
  DOCTYPE_CONTACTS_VERSION: 2,
  DOCTYPE_CONTACTS_GROUPS_VERSION: 2,
  DOCTYPE_CONTACTS_ACCOUNT_VERSION: 1,
  TOUTATICE_API_URL: process.env.COZY_URL.includes('mytoutatice.cloud')
    ? 'https://www.toutatice.fr'
    : 'https://partenaires.ipanema.education.fr'
}
