import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import pillowServerice from "../../service";

const publishMessageToTopic = async (pillow) => {
    const snsClient = new SNSClient({ region: process.env.REGION });

    var params = {
        Message: pillow,
        TopicArn: process.env.SNS_ARN //'arn:aws:sns:eu-west-1:606485506214:createProductTopic'
    };
       
    try {
        const input = new PublishCommand(params);

        const data = await snsClient.send(input)
        return data
    } catch (err) {
        console.log("Error", err);
    }
}

export const catalogBatchProcess = async (event) => {
    event.Records.map(async ({ body }) => {
        await pillowServerice.createPillow(JSON.parse(body))        
        await publishMessageToTopic(body)
    });
}