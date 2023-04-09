import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { Pillow } from "src/model/Pillow";
import { Stock } from "src/model/Stock";

interface PillowStock extends Pillow, Stock {}

export default class PillowServerice {
    constructor(private docClient: DocumentClient) { }

    async getAllPillows(): Promise<PillowStock[]> {
        const pillows = this.docClient.scan({
            TableName: process.env.PRODUCTS_TABLE_NAME,
        }).promise()

        const stocks = this.docClient.scan({
            TableName: process.env.STOCKS_TABLE_NAME,
        }).promise()

        const stocksPillows = await Promise.all([pillows, stocks]).then(([pillowsRes, stocksRes]) =>
            pillowsRes.Items.map((pillow) => 
                ({
                    ...pillow, 
                    ...{count: stocksRes.Items.find(stock => stock.product_id === pillow.id)?.count || 0}
                })
            )
        )
        
        return stocksPillows as PillowStock[];
    }

    async getPillow(productId: string): Promise<any> {
        const pillow = this.docClient.get({
            TableName: process.env.PRODUCTS_TABLE_NAME,
            Key: {
                id: productId
            }
        }).promise()

        const stock = this.docClient.get({
            TableName: process.env.STOCKS_TABLE_NAME,
            Key: {
                product_id: productId
            }
        }).promise()

        const pillowStock = await Promise.all([pillow, stock]).then(([pillowRes, stockRes]) => { 
            if (Object.keys(pillowRes.Item).length === 0) {
                throw new Error("Pillow does not exit");
            }
            
            return {
                ...pillowRes.Item, 
                ...{count: stockRes.Item?.count || 0}
            }
        })
        
        return pillowStock as PillowStock;
    }

    async createPillow(pillow: Pillow): Promise<Pillow> {
        await this.docClient.put({
            TableName: process.env.PRODUCTS_TABLE_NAME,
            Item: pillow
        }).promise()

        return pillow as Pillow;
    }

    async deletePillow(productId: string): Promise<any> {
        return await this.docClient.delete({
            TableName: process.env.PRODUCTS_TABLE_NAME,
            Key: {
                id: productId
            }
        }).promise();
    }
}