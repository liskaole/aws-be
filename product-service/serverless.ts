import type { AWS } from '@serverless/typescript';

import getProductsList from '@functions/getProductsList';
import getProductsById from '@functions/getProductsById';
import createProduct from '@functions/createProduct';
import catalogBatchProcess from '@functions/catalogBatchProcess';

const BUCKET = 'product-servise-task-6' //'product-shop-be-lambda'
const REGION = 'eu-west-1'

const serverlessConfiguration: AWS = {
  service: BUCKET,
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-webpack', 'serverless-offline', 'serverless-dynamodb-local'],
  provider: {
    name: 'aws',
    versionFunctions: false,
    runtime: 'nodejs16.x',
    region: REGION,
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      PRODUCTS_TABLE_NAME: '${file(environment.json):PRODUCTS_TABLE_NAME}',
      STOCKS_TABLE_NAME: '${file(environment.json):STOCKS_TABLE_NAME}',
      REGION: REGION,
      BUCKET: BUCKET,
      SQS_URL: { Ref: 'SQSQueue'},
      SNS_ARN: 'arn:aws:sns:eu-west-1:606485506214:createProductTopic' //{ Ref: 'SNSTopic'}
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: [
                'dynamodb:DescribeTable',
                'dynamodb:Query',
                'dynamodb:Scan',
                'dynamodb:GetItem',
                'dynamodb:PutItem',
                'dynamodb:UpdateItem',
                'dynamodb:DeleteItem'
            ],
            Resource: '*'
          },
          {
            Effect: 'Allow',
            Action: [
              'sqs:*'
            ],
            Resource: {'Fn::GetAtt': ['SQSQueue', 'Arn']}
          },
          {
            Effect: 'Allow',
            Action: [
              'sns:*'
            ],
            Resource: {
              Ref: 'SNSTopic'
            }
          }
        ]
      }
    }
  },
  resources: {
    Resources: {
      SQSQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'catalogItemsQueue'
        }
      },
      SNSTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: 'createProductTopic',
          DisplayName: 'SNSTopic'
        }
      },
      SNSSubscription: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: 'elizaveta_olenchenko@epam.com',
          Protocol: 'email',
          TopicArn: { Ref : 'SNSTopic'}
        }
      },
      SNSSubscriptionPrice: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: 'liiizzziii@mail.ru',
          Protocol: 'email',
          TopicArn: { Ref : 'SNSTopic'},
          FilterPolicyScope: 'MessageBody',
          FilterPolicy: '{"price": [{"numeric": ["<", 100]}]}'

        }
      }
    }
  },
  functions: { getProductsList, getProductsById, createProduct, catalogBatchProcess },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    webpack: {
      webpackConfig: 'webpack.config.js',
      packager: 'npm',
      includeModules: true,
    },
    dynamodb: {
      start: {
        port: 8008,
        inMemory: true,
        heapInitial: '200m',
        heapMax: '1g',
        migrate: true,
        seed: true,
        convertEmptyValues: true
      }
    }
  }
};

module.exports = serverlessConfiguration;
