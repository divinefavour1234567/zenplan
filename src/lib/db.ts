import { mockDb } from './mockdb';
import { dynamoDb } from './dynamodb';
import type { Habit, Profile } from './types';

export type { Habit, Profile };

export const isDynamoConfigured = !!(
  (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) ||
  process.env.DYNAMODB_TABLE_NAME ||
  process.env.STORAGE_DYNAMODB_TABLE_NAME ||
  process.env.USE_DYNAMODB === 'true'
);

if (typeof window === 'undefined') {
  console.log(
    `[ZenPlan Database] Active database provider: ${
      isDynamoConfigured ? 'Amazon DynamoDB' : 'Local File Simulator (.zenplan-db.json)'
    }`
  );
}

export const db = isDynamoConfigured ? dynamoDb : mockDb;
