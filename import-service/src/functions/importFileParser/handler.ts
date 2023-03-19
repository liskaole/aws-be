import { formatJSONResponse, formatJSONResponseError } from '@libs/api-gateway'
import { CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, GetObjectCommandOutput, S3Client } from '@aws-sdk/client-s3'
import { Readable } from 'stream'

import { parse } from "csv-parse";

export const asStream = (response: GetObjectCommandOutput) => { return response.Body as Readable};

const BUCKET = 'pillow-import-service'

const uploadAsStream = async (client: S3Client, params) => {
    console.log('params uploadAsStream', params) 

    try {
        const input = new GetObjectCommand(params)
        const response = await client.send(input);
        await new Promise((resolve, reject) => {
            asStream(response)
                .pipe(parse({
                    comment: "#",
                    columns: true,
                }))
                .on("data", function (file) {
                    console.log("CSV row: ", file);
                })
                .on("end", function () {
                    resolve("CSV parse has finished");
                })
                .on("error", function () {
                    reject("CSV parse has failed");
                });
        })
    } catch (e) {
        console.log('Error of adding file', e)

        return formatJSONResponseError({
            status: 500,
            message: e
        });
    }
}

const copyS3Object = async (client: S3Client, params) => {
    console.log('params copyS3Object', params) 

    try {
        const input = new CopyObjectCommand(params)
        const response = await client.send(input)

        deleteS3Object(client, params)
        console.log(`File ${params.key} was copied`, response);
    } catch (e) {
        console.log('Error of coping file', e)

        return formatJSONResponseError({
            status: 500,
            message: e
        });
    }
}

const deleteS3Object = async (client: S3Client, params) => {
    console.log('params deleteS3Object', params) 

    try {
        const input = new DeleteObjectCommand(params);
        const response = await client.send(input);

        console.log("File was deleted", response);
    } catch (e) {
        console.log('Error of deleting file', e)

        return formatJSONResponseError({
            status: 500,
            message: e
        });
    }
}

export const importFileParser = (event) => {
    const client = new S3Client({ region: 'eu-west-1' });

    console.log('event', JSON.stringify(event))

    event.Records.map(async (record) => {
        const [sourceFolder, fileName] = record.s3.object.key.split("/")

        uploadAsStream(client, {
            Bucket: BUCKET,
            Key: record.s3.object.key,
        })

        copyS3Object(client, {
            Bucket: BUCKET,
            CopySource: `${BUCKET}/${sourceFolder}/${fileName}`,
            Key: `parsed/${fileName}`,
        })

        deleteS3Object(client, {
            Bucket: BUCKET,
            Key: record.s3.object.key,
        })
    })

    return formatJSONResponse({
        statusCode: 202
    })
}