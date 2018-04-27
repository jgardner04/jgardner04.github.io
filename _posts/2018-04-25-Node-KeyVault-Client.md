---
layout: post
title:  "Node Azure Key Vault Client"
date:   2018-04-18 16:00:00
categories: Technology
tags: [Node, Key Vault]
author: Jonathan
sharing:
  twitter: Retrieve Azure Key Vault Secrets From Node #Node #KeyVault #Azure
  linkedin: Retrieve Azure Key Vault Secrets From Node.
---

Managing secrets is a challenge in every DevOps environment, I use [Azure Key Vault](https://azure.microsoft.com/en-us/services/key-vault/) to manage my secrets. When I was getting started working with Key Vault my biggest challenge was not getting secrets in, but how to get them out. The samples we provide with the [azure-keyvault](https://www.npmjs.com/package/azure-keyvault) NPM package didn't really fit what I was looking for so I created a Node client example I wanted to share here.

> _Tl;dr_ - I have created a [GitHub repo](https://github.com/jgardner04/NodeKeyVaultSecretClient) with a client.

To use the Node client for Key Vault you will need a few things.

* [Azure Key Vault](https://docs.microsoft.com/en-us/azure/key-vault/key-vault-get-started) (Obviously)
* [Azure Active Directory Application](https://docs.microsoft.com/en-us/azure/key-vault/key-vault-get-started#authorize) (Not as Obvious)

In my applicaiton I create a .ENV file with the following in it.

```bash
KEYVAULT_CLIENT_ID=<AAD Application ID>
KEYVAULT_CLIENT_SECRET=<AAD Application Client Secret>
KEYVAULT_VAULT_URI=<Key Vault Base URI>
KEYVAULT_SECRET_VERSION=<Key Vault Secret Version>
KEYVAULT_SECRET_NAME=<Key Vault Secret Name>
OUTFILE_LOCATION=<File Output Location>
```

You can use whatever package you want to load .ENV files, but I use [dotenv](https://www.npmjs.com/package/dotenv). Once I have my variables, My simple app will grab the secret and write it to a file. If you want to set it as a variable and use it in your application, it is an easy change.

```bash
const dotenv = require('dotenv')
const fs = require('fs')
const KeyVault = require('azure-keyvault')
const AuthenticationContext = require('adal-node').AuthenticationContext

// Load the .ENV file -- This will be run from process.env.<variable>

dotenv.config()

// Load the Key Vault Client variables
const clientId = process.env.KEYVAULT_CLIENT_ID
const clientSecret = process.env.KEYVAULT_CLIENT_SECRET
const secretName = process.env.KEYVAULT_SECRET_NAME
const secretVersion = process.env.KEYVAULT_SECRET_VERSION
const vaultUri = process.env.KEYVAULT_VAULT_URI
const outfile = process.env.OUTFILE_LOCATION

// Connect to Keyvault
const authenticator = function (challenge, callback) {
  const context = new AuthenticationContext(challenge.authorization)
  return context.acquireTokenWithClientCredentials(
    challenge.resource,
    clientId,
    clientSecret,
    function (err, tokenResponse) {
      if (err) throw err
      // Calculate the value to be set in the request's Authorization header and resume the call.
      var authorizationValue =
        tokenResponse.tokenType + ' ' + tokenResponse.accessToken

      return callback(null, authorizationValue)
    }
  )
}
const credentials = new KeyVault.KeyVaultCredentials(authenticator)
const client = new KeyVault.KeyVaultClient(credentials)

// Get the secret
client.getSecret(vaultUri, secretName, secretVersion, (err, res) => {
  if (err) {
    throw err
  }

  fs.writeFile(outfile, res.value, err => {
    if (err) {
      throw err
    }
    console.log(`${outfile} created`)
  })
})
```

Hope this little snippet helps you start using Azure Key Vault. In future posts, I will talk about how I am using Key Vault in my CI/CD pipeline.
