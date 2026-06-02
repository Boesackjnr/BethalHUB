export type OpportunityCategory = 'Tender' | 'RFQ' | 'Job' | 'Learnership' | 'Internship' | 'Community Project' | 'Training';

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  description: string;
  category: OpportunityCategory;
  deadline: string;
  location: string;
  contactDetails: string;
  attachmentUrl?: string;
  createdAt: any;
  status: 'open' | 'closed' | 'draft';
  authorId: string;
  businessId?: string;
}

export interface Business {
  id: string;
  name: string;
  logoUrl?: string;
  description: string;
  category: string;
  website?: string;
  social?: Record<string, string>;
  location: string;
  contact?: {
    phone?: string;
    email?: string;
  } | string;
  verified: boolean;
  isVerified?: boolean; // Support both names used in code
  ownerId: string;
  phoneNumber?: string;
}

export interface CommunityNotice {
  id: string;
  title: string;
  content: string;
  type: 'Municipal' | 'Water/Electricity' | 'Announcement' | 'Event' | 'Public Update' | 'Alert';
  createdAt: any;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  authorId: string;
}

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'individual' | 'business' | 'admin';
  isVerified: boolean;
  businessId?: string;
  createdAt: any;
  updatedAt?: any;
  bio?: string;
  phoneNumber?: string;
  location?: string;
  avatarUrl?: string;
}
