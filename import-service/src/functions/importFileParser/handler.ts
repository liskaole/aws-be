import { formatJSONResponse } from '@libs/api-gateway'
import { GetObjectCommand, GetObjectCommandOutput, S3Client } from '@aws-sdk/client-s3'
import { Readable } from 'stream'
import * as csvParser from 'csv-parser';

export const asStream = (response: GetObjectCommandOutput) => { return response.Body as Readable;};

const BUCKET = 'pillow-import-service'

export const importFileParser = async (event) => {
    const client = new S3Client({ region: 'eu-west-1' });

    event.Records.map(async (record) => {
        const response = await client.send(
            new GetObjectCommand({
              Bucket: BUCKET,
              Key: record.s3.object.key,
            })
        );
          // Parsing records
        const stream = asStream(response).pipe(csvParser({}));
        for await (const record of stream) {
            console.log(' -- Product: ', record);
        }
          
        // await s3.copyObject({
        //     Bucket: BUCKET,
        //     CopySource: BUCKET +  '/' + record.s3.object.key,
        //     Key: record.s3.object.key
        // }).promise();

        // await s3.deleteObject({
        //     Bucket: BUCKET,
        //     Key: record.s3.object.key
        // }).promise();

        console.log('uploaded image', record.s3.object.key.split('/')[1] + 'is created')
    })

    return formatJSONResponse({
        statusCode: 202
    })
}