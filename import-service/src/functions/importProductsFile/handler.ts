import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { formatJSONResponse, formatJSONResponseError } from "@libs/api-gateway";

const BUCKET = 'pillow-import-service'

export const importProductsFile = async (event) => {
    const client = new S3Client({ region: 'eu-west-1' })

    try {
        const params = {
            Bucket: BUCKET,
            Prefix: 'uploaded/',
        }

        const command = new ListObjectsV2Command(params);
        const s3Response = await client.send(command) 
        //const s3Response = await s3.ListObjectsV2Command(params).promise();
        const url = [
            ...s3Response.Contents
            .filter(file => file.Size && file.Key === (params.Prefix + event.queryStringParameters.name))
            .map(() => (`https://${BUCKET}.s3.amazonaws.com/uploaded/${ event.queryStringParameters.name }`))
        ][0]

        return url 
            ? formatJSONResponse({url: url})
            : formatJSONResponseError(
                { message: "Image does not exit" }, 
                404
            );
    } catch (e) {
        return formatJSONResponseError({
            status: 500,
            message: e
        });
    }
}