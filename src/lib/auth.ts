// Simple authentication utility for demo purposes
// In a real app, you'd use a proper authentication system like NextAuth.js

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  apiKey: string;
  emailNotifications: boolean;
  browserNotifications: boolean;
  marketingNotifications: boolean;
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  theme: string;
  language: string;
  timezone: string;
  subscriptionStatus: string;
  subscriptionPlan: string;
  subscriptionExpiry: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiUsage {
  currentUsage: number;
  monthlyLimit: number;
  usagePercentage: number;
  period: {
    start: string;
    end: string;
  };
}

// For demo purposes, we'll use a hardcoded user ID
// In a real app, this would come from authentication context
const DEMO_USER_ID = 'demo-user-id';

export async function getCurrentUser(): Promise<User> {
  const response = await fetch(`/api/users/${DEMO_USER_ID}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user data');
  }
  return response.json();
}

export async function updateUserSettings(settings: Partial<User>): Promise<User> {
  const response = await fetch(`/api/users/${DEMO_USER_ID}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update user settings');
  }
  
  return response.json();
}

export async function regenerateApiKey(): Promise<{ apiKey: string; message: string }> {
  const response = await fetch(`/api/users/${DEMO_USER_ID}/regenerate-api-key`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error('Failed to regenerate API key');
  }
  
  return response.json();
}

export async function getApiUsage(): Promise<ApiUsage> {
  const response = await fetch(`/api/users/${DEMO_USER_ID}/api-usage`);
  if (!response.ok) {
    throw new Error('Failed to fetch API usage');
  }
  
  return response.json();
}

export async function logout(): Promise<void> {
  // In a real app, this would clear authentication tokens/cookies
  // For demo purposes, we'll just redirect to login
  window.location.href = '/login';
}

export function getSubscriptionBadgeColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'pro':
      return 'bg-blue-100 text-blue-800';
    case 'enterprise':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function isSubscriptionActive(user: User): boolean {
  if (user.subscriptionStatus === 'free') return true;
  if (!user.subscriptionExpiry) return false;
  return new Date(user.subscriptionExpiry) > new Date();
}

export function getSubscriptionDisplayText(user: User): string {
  if (user.subscriptionStatus === 'free') return 'Free Plan';
  if (!isSubscriptionActive(user)) return 'Expired';
  return `${user.subscriptionPlan.charAt(0).toUpperCase() + user.subscriptionPlan.slice(1)} Plan`;
}
