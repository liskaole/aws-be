import * as AWS from 'aws-sdk';
import { faker } from '@faker-js/faker';
import { AWSError } from "aws-sdk";
import { PutItemOutput } from "aws-sdk/clients/dynamodb";

const ddb = new AWS.DynamoDB({region: 'eu-west-1'});


const paramsStock = (product_id: string): AWS.DynamoDB.PutItemInput => {
  return ({
    TableName: 'stocks',
    Item: {
      "product_id": {
        "S": product_id
      },
      "count": {
        "N": faker.datatype.number({ min: 0, max: 30 }).toString()
      }
    }
  })
}

const post = (paramsProduct: AWS.DynamoDB.PutItemInput) => {
  ddb.putItem(paramsProduct, (err: AWSError, dataProduct: PutItemOutput) => {
    err 
      ? console.log("Create Product Error", err)
      : ddb.putItem(paramsStock(paramsProduct.Item.id.S), (err: AWSError, dataStock: PutItemOutput) => {
          err
            ? console.log("Create Product Stock Error", err)
            : console.log("Success!", dataProduct, dataStock)
        })
  })
}

[...Array(100)].map(() => {
    const paramsProduct = {
        TableName: 'products',
        Item: {
            "id": {
              "S": faker.datatype.uuid()
            },
            "title": {
              "S": "Pillow " + faker.color.human()
            },
            "description": {
              "S": "Pillow " + faker.lorem.paragraph()
            },
            "matherials": {
              "S": faker.helpers.arrayElement(['Cotton', 'Synthetic fibers', 'Velvet'])
            },
            "filler": {
              "S": faker.helpers.arrayElement(['Down', 'Polyester Fiberfill', 'Feather Pillow', 'Memory Foam', 'Buckwheat Hull', 'Kapok', 'Wool', 'Microbead'])
            },
            "height": {
              "N": faker.helpers.arrayElement(['30', '40', '45', '50', '70', '90'])
            },
            "width": {
              "N": faker.helpers.arrayElement(['30', '40', '45', '50', '70', '90'])
            },
            "price": {
              "N": faker.datatype.number({ min: 50, max: 500 }).toString()
            }
        }
    };

    post(paramsProduct);
})