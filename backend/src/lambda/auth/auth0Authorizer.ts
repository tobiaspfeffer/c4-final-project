import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'
var jwksClient = require('jwks-rsa')

const logger = createLogger('auth')

const jwksUrl = 'https://dev-hyqe3p8v.eu.auth0.com/.well-known/jwks.json'
var client = jwksClient({
  jwksUri: jwksUrl
});

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken: JwtPayload  = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token: string = getToken(authHeader)
  logger.info('Token value', token)

  return new Promise((resolve, reject) => {
    verify(token, getKey, { algorithms: ["RS256"] }, (err, decoded) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(decoded as JwtPayload)
    });
  });
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

const getKey = (header, callback) => {
  client.getSigningKey(header.kid, function(err, key) {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key.getPublicKey();

    callback(null, signingKey);
  });
};
