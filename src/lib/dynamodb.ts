import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  DeleteCommand,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';
import { awsCredentialsProvider } from '@vercel/oidc-aws-credentials-provider';
import { Habit, Profile } from './types';

const region = process.env.AWS_REGION || process.env.STORAGE_AWS_REGION || 'us-east-1';

const clientConfig: any = {
  region,
};

const roleArn = process.env.AWS_ROLE_ARN || process.env.STORAGE_AWS_ROLE_ARN;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.STORAGE_AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.STORAGE_AWS_SECRET_ACCESS_KEY;
const sessionToken = process.env.AWS_SESSION_TOKEN || process.env.STORAGE_AWS_SESSION_TOKEN;

if (accessKeyId && secretAccessKey) {
  clientConfig.credentials = {
    accessKeyId,
    secretAccessKey,
  };
  if (sessionToken) {
    clientConfig.credentials.sessionToken = sessionToken;
  }
} else if (roleArn) {
  clientConfig.credentials = awsCredentialsProvider({
    roleArn,
  });
}

const ddbClient = new DynamoDBClient(clientConfig);
const docClient = DynamoDBDocumentClient.from(ddbClient);

const HABITS_TABLE = process.env.DYNAMODB_HABITS_TABLE || 'zenplan_habits';
const PROFILE_TABLE = process.env.DYNAMODB_PROFILE_TABLE || 'zenplan_profiles';
const DYNAMODB_TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || process.env.STORAGE_DYNAMODB_TABLE_NAME;
const DEFAULT_USER_ID = 'default-user';

// Streak Calculation Helper
function calculateStreaks(history: Record<string, boolean>): { current: number; max: number } {
  const dates = Object.keys(history)
    .filter((d) => history[d])
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (dates.length === 0) {
    return { current: 0, max: 0 };
  }

  let currentStreak = 0;
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const hasCompletedToday = history[todayStr];
  const hasCompletedYesterday = history[yesterdayStr];

  if (!hasCompletedToday && !hasCompletedYesterday) {
    currentStreak = 0;
  } else {
    let checkDate = hasCompletedToday ? new Date() : yesterday;
    let keepCounting = true;
    while (keepCounting) {
      const checkStr = checkDate.toISOString().split('T')[0];
      if (history[checkStr]) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        keepCounting = false;
      }
    }
  }

  let maxStreak = 0;
  let tempStreak = 0;
  const sortedDatesAsc = Object.keys(history)
    .filter((d) => history[d])
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  if (sortedDatesAsc.length > 0) {
    let lastDate: Date | null = null;
    for (const dStr of sortedDatesAsc) {
      const curDate = new Date(dStr);
      if (lastDate === null) {
        tempStreak = 1;
      } else {
        const diffTime = Math.abs(curDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          if (tempStreak > maxStreak) maxStreak = tempStreak;
          tempStreak = 1;
        }
      }
      lastDate = curDate;
    }
    if (tempStreak > maxStreak) maxStreak = tempStreak;
  }

  return { current: currentStreak, max: maxStreak };
}

export const dynamoDb = {
  getHabits: async (): Promise<Habit[]> => {
    try {
      if (DYNAMODB_TABLE_NAME) {
        // Vercel Single-Table Integration Mode
        const result = await docClient.send(
          new ScanCommand({
            TableName: DYNAMODB_TABLE_NAME,
            FilterExpression: 'SK = :sk',
            ExpressionAttributeValues: { ':sk': 'HABIT' },
          })
        );
        return (result.Items as Habit[]) || [];
      } else {
        // Multi-Table Mode
        const result = await docClient.send(
          new ScanCommand({
            TableName: HABITS_TABLE,
          })
        );
        return (result.Items as Habit[]) || [];
      }
    } catch (error) {
      console.error('DynamoDB Scan error:', error);
      return [];
    }
  },

  addHabit: async (name: string, description: string, category: string, frequency: string): Promise<Habit> => {
    const newHabit: Habit = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      description,
      category,
      frequency,
      createdAt: new Date().toISOString(),
      history: {},
      currentStreak: 0,
      maxStreak: 0,
    };

    if (DYNAMODB_TABLE_NAME) {
      // Vercel Single-Table Integration Mode
      await docClient.send(
        new PutCommand({
          TableName: DYNAMODB_TABLE_NAME,
          Item: {
            ...newHabit,
            PK: `HABIT#${newHabit.id}`,
            SK: 'HABIT',
          },
        })
      );
    } else {
      // Multi-Table Mode
      await docClient.send(
        new PutCommand({
          TableName: HABITS_TABLE,
          Item: newHabit,
        })
      );
    }
    return newHabit;
  },

  toggleHabitDay: async (habitId: string, dateStr: string): Promise<Habit | null> => {
    let getResult;
    if (DYNAMODB_TABLE_NAME) {
      // Vercel Single-Table Integration Mode
      getResult = await docClient.send(
        new GetCommand({
          TableName: DYNAMODB_TABLE_NAME,
          Key: { PK: `HABIT#${habitId}`, SK: 'HABIT' },
        })
      );
    } else {
      // Multi-Table Mode
      getResult = await docClient.send(
        new GetCommand({
          TableName: HABITS_TABLE,
          Key: { id: habitId },
        })
      );
    }

    const habit = getResult.Item as Habit;
    if (!habit) return null;

    if (!habit.history) {
      habit.history = {};
    }
    habit.history[dateStr] = !habit.history[dateStr];

    const { current, max } = calculateStreaks(habit.history);
    habit.currentStreak = current;
    habit.maxStreak = max;

    if (DYNAMODB_TABLE_NAME) {
      // Vercel Single-Table Integration Mode
      await docClient.send(
        new PutCommand({
          TableName: DYNAMODB_TABLE_NAME,
          Item: {
            ...habit,
            PK: `HABIT#${habitId}`,
            SK: 'HABIT',
          },
        })
      );
    } else {
      // Multi-Table Mode
      await docClient.send(
        new PutCommand({
          TableName: HABITS_TABLE,
          Item: habit,
        })
      );
    }

    return habit;
  },

  deleteHabit: async (habitId: string): Promise<boolean> => {
    if (DYNAMODB_TABLE_NAME) {
      // Vercel Single-Table Integration Mode
      await docClient.send(
        new DeleteCommand({
          TableName: DYNAMODB_TABLE_NAME,
          Key: { PK: `HABIT#${habitId}`, SK: 'HABIT' },
        })
      );
    } else {
      // Multi-Table Mode
      await docClient.send(
        new DeleteCommand({
          TableName: HABITS_TABLE,
          Key: { id: habitId },
        })
      );
    }
    return true;
  },

  getProfile: async (): Promise<Profile> => {
    try {
      let result;
      if (DYNAMODB_TABLE_NAME) {
        // Vercel Single-Table Integration Mode
        result = await docClient.send(
          new GetCommand({
            TableName: DYNAMODB_TABLE_NAME,
            Key: { PK: `PROFILE#${DEFAULT_USER_ID}`, SK: 'PROFILE' },
          })
        );
      } else {
        // Multi-Table Mode
        result = await docClient.send(
          new GetCommand({
            TableName: PROFILE_TABLE,
            Key: { userId: DEFAULT_USER_ID },
          })
        );
      }

      if (result.Item) {
        return {
          name: result.Item.name,
          email: result.Item.email,
          isPremium: result.Item.isPremium,
          premiumSince: result.Item.premiumSince,
        };
      }
    } catch (error) {
      console.error('DynamoDB Get Profile error:', error);
    }
    return {
      name: 'Zen Developer',
      email: 'zen@hackathon.com',
      isPremium: false,
      premiumSince: null,
    };
  },

  updateProfile: async (updates: Partial<Profile>): Promise<Profile> => {
    const current = await dynamoDb.getProfile();
    const updated = { ...current, ...updates };

    if (DYNAMODB_TABLE_NAME) {
      // Vercel Single-Table Integration Mode
      await docClient.send(
        new PutCommand({
          TableName: DYNAMODB_TABLE_NAME,
          Item: {
            ...updated,
            PK: `PROFILE#${DEFAULT_USER_ID}`,
            SK: 'PROFILE',
          },
        })
      );
    } else {
      // Multi-Table Mode
      await docClient.send(
        new PutCommand({
          TableName: PROFILE_TABLE,
          Item: {
            ...updated,
            userId: DEFAULT_USER_ID,
          },
        })
      );
    }

    return {
      name: updated.name,
      email: updated.email,
      isPremium: updated.isPremium,
      premiumSince: updated.premiumSince,
    };
  },
};
