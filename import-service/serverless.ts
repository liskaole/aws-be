import importFileParser from '@functions/importFileParser';
import importProductsFile from '@functions/importProductsFile';
import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'pillow-import-service',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-webpack', 'serverless-offline'],
  provider: {
    name: 'aws',
    runtime: 'nodejs16.x',
    region: 'eu-west-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: [
              "s3:ListBucket"
            ],
            Resource: "arn:aws:s3:::pillow-import-service"
          },
          {
            Effect: 'Allow',
            Action: [
              "s3:*"
            ],
            Resource: "arn:aws:s3:::pillow-import-service/*"
          }
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
