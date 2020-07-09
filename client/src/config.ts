// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = '5fy0vmxdnl'
export const apiEndpoint = `https://${apiId}.execute-api.eu-central-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-hyqe3p8v.eu.auth0.com',            // Auth0 domain
  clientId: 'lPxDL4HagqdxFJqcLhcJXEkp5EmnnS0V',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
