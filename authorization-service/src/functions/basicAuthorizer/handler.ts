import { APIGatewayErrorMessage } from "@libs/api-gateway"

const generatePolicy = (effect: 'Allow' | 'Deny', resource, principal) => ({
    principalId: principal,
    policyDocument: {
        Version: "2012-10-17",
        Statement: [
            {
                Action: "execute-api:Invoke",
                Effect: effect,
                Resource: resource
            }
        ]
    }
})

export const basicAuthorizer = (event, context, callback) => {
    console.log('event', JSON.stringify(event), context)
    const { headers, methodArn } = event

    if (!headers) {
        throw new Error(APIGatewayErrorMessage.Unauthorized);
    }

    // Construct the Basic Auth string
    const authString = 'Basic ' + Buffer.from(process.env.LOGIN + ':' + process.env.PASSWORD, 'utf8').toString('base64');

    if (headers.Authorization && headers.Authorization === authString) {
        callback(null, generatePolicy('Allow', methodArn, "user"));
    } else {
        callback(null, generatePolicy('Deny', methodArn, "user"));
    }
}