import basicAuthorizer from '@functions/basicAuthorizer';
import type { AWS } from '@serverless/typescript';

const BUCKET = 'pillow-authorization-service'
const REGION = 'eu-west-1'

const serverlessConfiguration: AWS = {
  service: BUCKET,
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-webpack', 'serverless-offline', 'serverless-dotenv-plugin'],
  useDotenv: true,
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
      LOGIN: 'ElizavetaOlenchenko',
      PASSWORD: '${env:ElizavetaOlenchenko}'
    }
  },
  functions: { basicAuthorizer },
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
