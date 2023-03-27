import { formatJSONResponse, formatJSONResponseError } from '@libs/api-gateway'
import { CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, GetObjectCommandOutput, S3Client } from '@aws-sdk/client-s3'
import { SendMessageCommand, SQSClient } from  "@aws-sdk/client-sqs";
import { Readable } from 'stream'

import { parse } from "csv-parse";

export const asStream = (response: GetObjectCommandOutput) => { return response.Body as Readable};

const REGION = 'eu-west-1'
const BUCKET = 'pillow-import-service'

const sqsSendMessage = async (message) => {
    const sqsClient = new SQSClient({ region: REGION });

    try {
        const input = new SendMessageCommand({
            QueueUrl: process.env.SQS_URL,
            MessageBody: JSON.stringify(message)
        });
        
        await sqsClient.send(input)
    } catch (e) {
        return formatJSONResponseError({
            status: 500,
            message: e
        });
    }
}

const uploadAsStream = async (client: S3Client, params) => {
    try {
        const input = new GetObjectCommand(params)
        const response = await client.send(input);
        return await new Promise((resolve, reject) => {
            asStream(response)
                .pipe(parse({
                    comment: "#",
                    columns: true,
                }))
                .on("data", (file) => sqsSendMessage(file))
                .on("end", () => {
                    resolve("CSV parse has finished");
                })
                .on("error", e => {
                    reject("CSV parse has failed with error: " + e);
                })
        })
    } catch (e) {
        return formatJSONResponseError({
            status: 500,
            message: e
        });
    }
}

const copyS3Object = async (client: S3Client, params) => {
    try {
        const input = new CopyObjectCommand(params)
        return await client.send(input)

    } catch (e) {
        return formatJSONResponseError({
            status: 500,
            message: e
        });
    }
}

const deleteS3Object = async (client: S3Client, params) => {
    try {
        const input = new DeleteObjectCommand(params)
        return await client.send(input)

    } catch (e) {
        return formatJSONResponseError({
            status: 500,
            message: e
        });
    }
}

export const importFileParser = (event) => {
    const client = new S3Client({ region: REGION })

    event.Records.map(async (record) => {
        const [sourceFolder, fileName] = record.s3.object.key.split("/")

        await uploadAsStream(client, {
            Bucket: BUCKET,
            Key: record.s3.object.key,
        })

        await copyS3Object(client, {
            Bucket: BUCKET,
            CopySource: `${BUCKET}/${sourceFolder}/${fileName}`,
            Key: `parsed/${fileName}`,
        })

        await deleteS3Object(client, {
            Bucket: BUCKET,
            Key: record.s3.object.key,
        })
    })

    return formatJSONResponse({
        statusCode: 202
    })
}