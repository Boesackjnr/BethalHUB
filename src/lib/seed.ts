import { collection, addDoc, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

export const seedDatabase = async () => {
  const sampleBusinesses = [
    {
      name: "Bethal Food & Veg",
      category: "Grocery",
      description: "Fresh local produce for the Bethal community.",
      location: "Bethal Central",
      contact: "017 647 1234",
      verified: true,
      ownerId: "system",
      website: "https://example.com"
    },
    {
      name: "Govan Mbeki Tech Solutions",
      category: "IT Services",
      description: "Professional computer repairs and networking.",
      location: "eMzinoni",
      contact: "017 647 5678",
      verified: true,
      ownerId: "system"
    }
  ];

  const sampleOpportunities = [
    {
      title: "Municipal Waste Management Tender",
      organization: "Govan Mbeki Municipality",
      category: "Tender",
      description: "The municipality invites bids for waste collection services in Bethal and surrounding areas.",
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Secunda/Bethal",
      status: "open",
      authorId: "system",
      createdAt: serverTimestamp()
    },
    {
      title: "Junior Admin Assistant",
      organization: "Bethal Agri-Business",
      category: "Job",
      description: "Looking for a motivated individual to help with daily administrative tasks.",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Bethal North",
      status: "open",
      authorId: "system",
      createdAt: serverTimestamp()
    }
  ];

  const sampleNotices = [
    {
      title: "Scheduled Power Maintenance",
      content: "Electricity will be down in Bethal West on Wednesday from 08:00 to 16:00 for infrastructure upgrades.",
      type: "Water/Electricity",
      priority: "high",
      authorId: "system",
      createdAt: serverTimestamp()
    },
    {
      title: "Community Clean-up Day",
      content: "Join us this Saturday at the Town Square for our monthly neighborhood cleanup. Refuse bags provided.",
      type: "Event",
      priority: "medium",
      authorId: "system",
      createdAt: serverTimestamp()
    }
  ];

  try {
    // Seed Businesses
    for (const biz of sampleBusinesses) {
      await addDoc(collection(db, 'businesses'), biz);
    }

    // Seed Opportunities
    for (const opp of sampleOpportunities) {
      await addDoc(collection(db, 'opportunities'), opp);
    }

    // Seed Notices
    for (const notice of sampleNotices) {
      await addDoc(collection(db, 'notices'), notice);
    }

    // Create a connection test document
    await setDoc(doc(db, 'test', 'connection'), { lastSeeded: serverTimestamp() });

    return { success: true };
  } catch (error) {
    console.error("Seeding error:", error);
    throw error;
  }
};
