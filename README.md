# [Cozy][cozy] Toutatice

## What's Cozy?

![Cozy Logo](https://cdn.rawgit.com/cozy/cozy-guidelines/master/templates/cozy_logo_small.svg)

[Cozy] is a personal data platform that brings all your web services in the same private space. With it, your webapps and your devices can share data easily, providing you with a new experience. You can install Cozy on your own hardware where no one's tracking you.

## What is this konnector about ?

This konnector interacts with the [Toutatice] platform.

### Run and test

Create a `konnector-dev-config.json` file at the root with the URL of the Cozy :

```javascript
{
  "COZY_URL": "http://cozy.tools:8080"
}
```

Then you will need a token to make requests to [Toutatice]. Make sure no server is listening on `cozy.tools:8080` then run `yarn token`.

Finally, run the konnector:

```sh
yarn dev
```

### Real OAuth authentication

You will need a cozy-stack running on your local machine.

:warning: If you do not have [nsjail](https://github.com/google/nsjail) installed on your system, you'll have to configure the cozy-stack's server to run connectors directly with nodejs: if you don't already have a config file, copy example config from cozy-stack repository to create one in `~/.cozy/cozy.yaml`.

```
cp cozy-stack/cozy.example.yaml $HOME/.cozy/cozy.yaml
```

In this file, change the konnectors command to run connectors with node (you may need to use the absolute path):

```
konnectors:
  cmd: <path_to_your_cozy-stack>/cozy-stack/scripts/konnector-node-run.sh
```

Then, remove/comment lines about vault and mail service (SMTP).

Restart the `cozy-stack`.

Next, build and install the konnector:

```
yarn build
cozy-stack konnectors install toutatice file://$PWD/build
```

Then you'll have to register the konnector's oauth system into the cozy-stack's server with the following (see it on [cozy/cozy-stack](https://github.com/cozy/cozy-stack/blob/master/docs/konnectors-workflow.md#example-google)):

```
curl -X PUT 'localhost:5984/secrets%2Fio-cozy-account_types'
curl -X PUT localhost:5984/secrets%2Fio-cozy-account_types/toutatice -d '{ "grant_mode": "authorization_code", "client_id": "<CLIENT_ID>", "client_secret": "<CLIENT_SECRET>", "auth_endpoint": "https://partenaires.ipanema.education.fr/idp/profile/oidc/authorize", "token_endpoint": "https://partenaires.ipanema.education.fr/idp/profile/oidc/token" }'
```

Make sure that `http://cozy.tools:8080/accounts/toutatice/redirect` is whitelisted as a redirect URL on the Toutatice endpoint.

Then, you can install the app you want to use with the connector, it should use your local build of the connector.
For example, you can install `cozy-home` (`cozy-stack apps install home`) and run the synchronization from the Home app.

Note that each time you change something in the connector's code, you will need to rebuild it and update it on the stack side:

```
yarn build
cozy-stack konnectors update toutatice file://$PWD/build
```

To have a better understanding of what happens, you may also need to activate debug mode on the stack (be aware that if you restart the stack you will need to re-enable debug mode):

```
cozy-stack instances debug cozy.tools:8080 true
```

## License

Cozy Toutatice is developed by Cozy Cloud and distributed under the [AGPL v3 license][agpl-3.0].

[cozy]: https://cozy.io 'Cozy Cloud'
[agpl-3.0]: https://www.gnu.org/licenses/agpl-3.0.html
[freenode]: http://webchat.freenode.net/?randomnick=1&channels=%23cozycloud&uio=d4
[forum]: https://forum.cozy.io/
[github]: https://github.com/cozy/
[nodejs]: https://nodejs.org/
[standard]: https://standardjs.com
[twitter]: https://twitter.com/mycozycloud
[webpack]: https://webpack.js.org
[yarn]: https://yarnpkg.com
[travis]: https://travis-ci.org
[contribute]: CONTRIBUTING.md
[toutatice]: https://www.toutatice.fr/portail
