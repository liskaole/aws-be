import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { formatJSONResponse, formatJSONResponseError } from "@libs/api-gateway";

const BUCKET = 'pillow-import-service'

export const importProductsFile = async (event) => {
    const client = new S3Client({ region: 'eu-west-1'})

    const params = {
        Bucket: BUCKET,
        Key: `uploaded/${event.queryStringParameters.name}`,
    }

    const command = new PutObjectCommand(params);

    try {
        const signedUrl = await getSignedUrl(client, command, { expiresIn: 60 });
        return formatJSONResponse({ url: signedUrl })
    } catch (e) {
        return formatJSONResponseError({
            status: 500,
            message: e
        });
    }
}