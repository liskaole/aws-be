import importFileParser from '@functions/importFileParser';
import importProductsFile from '@functions/importProductsFile';
import type { AWS } from '@serverless/typescript';

const BUCKET = 'pillow-import-service'
const REGION = 'eu-west-1'

const serverlessConfiguration: AWS = {
  service: BUCKET,
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-webpack', 'serverless-offline'],
  provider: {
    name: 'aws',
    runtime: 'nodejs16.x',
    region: REGION,
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      REGION: REGION,
      BUCKET: BUCKET,
      SQS_URL: 'https://sqs.eu-west-1.amazonaws.com/606485506214/catalogItemsQueue' //'SQSQueue'
    },
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: [
              "s3:ListBucket"
            ],
            Resource: `arn:aws:s3:::${BUCKET}`,
          },
          {
            Effect: "Allow",
            Action: [
              "s3:*"
            ],
            Resource: `arn:aws:s3:::${BUCKET}/*`,
          },
          {
            Effect: 'Allow',
            Action: [
              'sqs:*'
            ],
            Resource: 'arn:aws:sqs:eu-west-1:606485506214:catalogItemsQueue'
          },
        ]
      }
    }
  },
  functions: { importProductsFile, importFileParser },
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
    }
  }
};

module.exports = serverlessConfiguration;
