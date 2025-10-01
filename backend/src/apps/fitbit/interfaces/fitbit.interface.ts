export interface FitbitTokenResponse {
  access_token: string;
  refresh_token: string;
  user_id: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface FitbitUserProfile {
  user: {
    age: number;
    avatar: string;
    country: string;
    dateOfBirth: string;
    displayName: string;
    encodedId: string;
    firstName: string;
    fullName: string;
    gender: string;
    height: number;
    lastName: string;
    locale: string;
    memberSince: string;
    timezone: string;
    weight: number;
  };
}

export interface FitbitActivitySummary {
  summary: {
    activeScore: number;
    activityCalories: number;
    caloriesBMR: number;
    caloriesOut: number;
    distances: Array<{
      activity: string;
      distance: number;
    }>;
    steps: number;
    floors: number;
    elevation: number;
  };
}

export interface FitbitHeartRateData {
  'activities-heart': Array<{
    dateTime: string;
    value: {
      restingHeartRate?: number;
      heartRateZones: Array<{
        caloriesOut: number;
        max: number;
        min: number;
        minutes: number;
        name: string;
      }>;
    };
  }>;
}

export interface FitbitActivityType {
  id: number;
  name: string;
  hasSpeed: boolean;
  mets: number;
  accessLevel: string;
}

export interface FitbitActivityTypesResponse {
  categories: Array<{
    id: number;
    name: string;
    subCategories?: Array<{
      id: number;
      name: string;
      activities: FitbitActivityType[];
    }>;
    activities: FitbitActivityType[];
  }>;
}

export interface FitbitSleepLog {
  sleep: Array<{
    dateOfSleep: string;
    duration: number;
    efficiency: number;
    endTime: string;
    minutesAfterWakeup: number;
    minutesAsleep: number;
    minutesAwake: number;
    minutesToFallAsleep: number;
    startTime: string;
    timeInBed: number;
    type: string;
  }>;
}

export interface FitbitDailySummary {
  summary: {
    steps: number;
    distance: number;
    floors: number;
    elevation: number;
    calories: number;
    activeMinutes: number;
  };
}