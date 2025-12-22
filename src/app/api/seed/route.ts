import { NextResponse } from 'next/server';
import { collection, doc, setDoc, getDocs, deleteDoc, Timestamp, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';

// Use the same top-level collections as the rest of the app
const objectsCollection = collection(db, 'objects'); // Things to rate
const membersCollection = collection(db, 'members'); // Users in groups

// Mock objects for each group (the things being rated)
const mockObjects: Record<string, Array<{ name: string; category: string | null; description?: string }>> = {
  'nba-best': [
    { name: 'LeBron James', category: 'Player', description: 'Los Angeles Lakers forward' },
    { name: 'Stephen Curry', category: 'Player', description: 'Golden State Warriors guard' },
    { name: 'Giannis Antetokounmpo', category: 'Player', description: 'Milwaukee Bucks forward' },
    { name: 'Kevin Durant', category: 'Player', description: 'Phoenix Suns forward' },
    { name: 'Luka Doncic', category: 'Player', description: 'Dallas Mavericks guard' },
    { name: 'Boston Celtics', category: 'Team', description: '2024 NBA Champions' },
    { name: 'Denver Nuggets', category: 'Team', description: '2023 NBA Champions' },
    { name: 'Los Angeles Lakers', category: 'Team', description: '17-time NBA Champions' },
    { name: 'Golden State Warriors', category: 'Team', description: '7-time NBA Champions' },
  ],
  'nfl-best': [
    { name: 'Patrick Mahomes', category: 'Player', description: 'Kansas City Chiefs quarterback' },
    { name: 'Josh Allen', category: 'Player', description: 'Buffalo Bills quarterback' },
    { name: 'Travis Kelce', category: 'Player', description: 'Kansas City Chiefs tight end' },
    { name: 'Tyreek Hill', category: 'Player', description: 'Miami Dolphins wide receiver' },
    { name: 'Micah Parsons', category: 'Player', description: 'Dallas Cowboys linebacker' },
    { name: 'Kansas City Chiefs', category: 'Team', description: 'Back-to-back Super Bowl Champions' },
    { name: 'San Francisco 49ers', category: 'Team', description: 'NFC powerhouse' },
    { name: 'Philadelphia Eagles', category: 'Team', description: 'NFC East contender' },
    { name: 'Detroit Lions', category: 'Team', description: 'NFC North rising team' },
  ],
  'presidential-2028': [
    { name: 'Gavin Newsom', category: null, description: 'Governor of California' },
    { name: 'Ron DeSantis', category: null, description: 'Governor of Florida' },
    { name: 'J.D. Vance', category: null, description: 'Vice President' },
    { name: 'Josh Shapiro', category: null, description: 'Governor of Pennsylvania' },
    { name: 'Gretchen Whitmer', category: null, description: 'Governor of Michigan' },
    { name: 'Tim Scott', category: null, description: 'Senator from South Carolina' },
  ],
  'oscars-2026': [
    { name: 'Timothée Chalamet', category: 'Actor', description: 'Dune, Wonka' },
    { name: 'Florence Pugh', category: 'Actor', description: 'Oppenheimer, Little Women' },
    { name: 'Margot Robbie', category: 'Actor', description: 'Barbie, Once Upon a Time' },
    { name: 'Cillian Murphy', category: 'Actor', description: 'Oppenheimer Best Actor winner' },
    { name: 'Dune: Part Two', category: 'Movie', description: 'Denis Villeneuve epic' },
    { name: 'Oppenheimer', category: 'Movie', description: 'Christopher Nolan biopic' },
    { name: 'Barbie', category: 'Movie', description: 'Greta Gerwig film' },
    { name: 'Denis Villeneuve', category: 'Director', description: 'Dune, Blade Runner 2049' },
    { name: 'Christopher Nolan', category: 'Director', description: 'Oppenheimer, The Dark Knight' },
    { name: 'Greta Gerwig', category: 'Director', description: 'Barbie, Little Women' },
  ],
};

// Mock data for featured groups
const mockGroups = [
  {
    id: 'nba-best',
    name: "NBA's Best",
    description: 'Rating the best NBA players and teams across different metrics',
    captainId: 'user_mock_captain', // Will be updated with actual user ID
    coCaptainIds: [],
    itemCategories: ['Player', 'Team'],
    metrics: [
      {
        id: 'scoring',
        name: 'Scoring',
        description: 'Points per game and scoring efficiency',
        order: 0,
        minValue: 0,
        maxValue: 100,
        prefix: '' as const,
        suffix: '' as const,
        applicableCategories: ['Player'],
      },
      {
        id: 'defense',
        name: 'Defense',
        description: 'Defensive impact and ability',
        order: 1,
        minValue: 0,
        maxValue: 100,
        prefix: '' as const,
        suffix: '' as const,
        applicableCategories: ['Player'],
      },
      {
        id: 'playmaking',
        name: 'Playmaking',
        description: 'Assists and court vision',
        order: 2,
        minValue: 0,
        maxValue: 100,
        prefix: '' as const,
        suffix: '' as const,
        applicableCategories: ['Player'],
      },
      {
        id: 'team-chemistry',
        name: 'Team Chemistry',
        description: 'How well the team plays together',
        order: 3,
        minValue: 0,
        maxValue: 100,
        prefix: '' as const,
        suffix: '' as const,
        applicableCategories: ['Team'],
      },
      {
        id: 'championship-potential',
        name: 'Championship Potential',
        description: 'Likelihood to win it all',
        order: 4,
        minValue: 0,
        maxValue: 100,
        prefix: '' as const,
        suffix: '%' as const,
        applicableCategories: ['Team'],
      },
    ],
    defaultYMetricId: 'scoring',
    defaultXMetricId: 'defense',
    lockedYMetricId: null,
    lockedXMetricId: null,
    captainControlEnabled: true,
    isPublic: true,
    isOpen: true,
    isFeatured: true,
    viewCount: 1250,
    ratingCount: 342,
    shareCount: 89,
  },
  {
    id: 'nfl-best',
    name: "NFL's Best",
    description: 'Rating NFL players and teams on key performance metrics',
    captainId: 'user_mock_captain',
    coCaptainIds: [],
    itemCategories: ['Player', 'Team'],
    metrics: [
      {
        id: 'athleticism',
        name: 'Athleticism',
        description: 'Speed, strength, and agility',
        order: 0,
        minValue: 0,
        maxValue: 100,
        prefix: '' as const,
        suffix: '' as const,
        applicableCategories: ['Player'],
      },
      {
        id: 'game-iq',
        name: 'Game IQ',
        description: 'Football intelligence and decision making',
        order: 1,
        minValue: 0,
        maxValue: 100,
        prefix: '' as const,
        suffix: '' as const,
        applicableCategories: ['Player'],
      },
      {
        id: 'clutch',
        name: 'Clutch Factor',
        description: 'Performance in high-pressure moments',
        order: 2,
        minValue: 0,
        maxValue: 100,
        prefix: '' as const,
        suffix: '' as const,
        applicableCategories: ['Player'],
      },
      {
        id: 'roster-depth',
        name: 'Roster Depth',
        description: 'Quality of backup players',
        order: 3,
        minValue: 0,
        maxValue: 100,
        prefix: '' as const,
        suffix: '' as const,
        applicableCategories: ['Team'],
      },
      {
        id: 'super-bowl-odds',
        name: 'Super Bowl Odds',
        description: 'Chances of winning the Super Bowl',
        order: 4,
        minValue: 0,
        maxValue: 100,
        prefix: '' as const,
        suffix: '%' as const,
        applicableCategories: ['Team'],
      },
    ],
    defaultYMetricId: 'athleticism',
    defaultXMetricId: 'game-iq',
    lockedYMetricId: null,
    lockedXMetricId: null,
    captainControlEnabled: true,
    isPublic: true,
    isOpen: true,
    isFeatured: true,
    viewCount: 980,
    ratingCount: 275,
    shareCount: 62,
  },
  {
    id: 'presidential-2028',
    name: '2028 Presidential Candidates',
    description: 'Rate potential 2028 presidential candidates on key qualities',
    captainId: 'user_mock_captain',
    coCaptainIds: [],
    itemCategories: [],
    metrics: [
      {
        id: 'leadership',
        name: 'Leadership',
        description: 'Ability to lead and inspire',
        order: 0,
        minValue: 0,
        maxValue: 100,
        prefix: '' as const,
        suffix: '' as const,
        applicableCategories: [],
      },
      {
        id: 'experience',
        name: 'Experience',
        description: 'Political and professional experience',
        order: 1,
        minValue: 0,
        maxValue: 100,
        prefix: '' as const,
        suffix: '' as const,
        applicableCategories: [],
      },
      {
        id: 'electability',
        name: 'Electability',
        description: 'Likelihood to win the election',
        order: 2,
        minValue: 0,
        maxValue: 100,
        prefix: '' as const,
        suffix: '%' as const,
        applicableCategories: [],
      },
      {
        id: 'policy-strength',
        name: 'Policy Strength',
        description: 'Quality and clarity of policy positions',
        order: 3,
        minValue: 0,
        maxValue: 100,
        prefix: '' as const,
        suffix: '' as const,
        applicableCategories: [],
      },
    ],
    defaultYMetricId: 'leadership',
    defaultXMetricId: 'electability',
    lockedYMetricId: null,
    lockedXMetricId: null,
    captainControlEnabled: true,
    isPublic: true,
    isOpen: true,
    isFeatured: true,
    viewCount: 2100,
    ratingCount: 567,
    shareCount: 234,
  },
  {
    id: 'oscars-2026',
    name: '2026 Oscar Nominees',
    description: 'Rate the potential 2026 Oscar nominees across categories',
    captainId: 'user_mock_captain',
    coCaptainIds: [],
    itemCategories: ['Actor', 'Movie', 'Director'],
    metrics: [
      {
        id: 'acting',
        name: 'Acting Performance',
        description: 'Quality of acting performance',
        order: 0,
        minValue: 0,
        maxValue: 100,
        prefix: '' as const,
        suffix: '' as const,
        applicableCategories: ['Actor'],
      },
      {
        id: 'box-office',
        name: 'Box Office',
        description: 'Commercial success',
        order: 1,
        minValue: 0,
        maxValue: 1000,
        prefix: '$' as const,
        suffix: 'M' as const,
        applicableCategories: ['Movie'],
      },
      {
        id: 'critical-acclaim',
        name: 'Critical Acclaim',
        description: 'Critical reception and reviews',
        order: 2,
        minValue: 0,
        maxValue: 100,
        prefix: '' as const,
        suffix: '' as const,
        applicableCategories: ['Movie', 'Actor', 'Director'],
      },
      {
        id: 'oscar-odds',
        name: 'Oscar Odds',
        description: 'Likelihood to win the Oscar',
        order: 3,
        minValue: 0,
        maxValue: 100,
        prefix: '' as const,
        suffix: '%' as const,
        applicableCategories: ['Movie', 'Actor', 'Director'],
      },
      {
        id: 'direction',
        name: 'Direction Quality',
        description: 'Quality of directing',
        order: 4,
        minValue: 0,
        maxValue: 100,
        prefix: '' as const,
        suffix: '' as const,
        applicableCategories: ['Director', 'Movie'],
      },
    ],
    defaultYMetricId: 'critical-acclaim',
    defaultXMetricId: 'oscar-odds',
    lockedYMetricId: null,
    lockedXMetricId: null,
    captainControlEnabled: true,
    isPublic: true,
    isOpen: true,
    isFeatured: true,
    viewCount: 1567,
    ratingCount: 423,
    shareCount: 156,
  },
];

export async function POST(request: Request) {
  try {
    // Get the captain email from the request body
    const { captainEmail, captainClerkId } = await request.json();

    if (!captainEmail || !captainClerkId) {
      return NextResponse.json(
        { error: 'Captain email and clerkId are required' },
        { status: 400 }
      );
    }

    const now = Timestamp.now();
    const sevenDaysAgo = Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

    const createdGroups = [];

    for (const groupData of mockGroups) {
      const groupRef = doc(collection(db, 'groups'), groupData.id);

      // Delete existing objects for this group
      const existingObjectsQuery = query(objectsCollection, where('groupId', '==', groupData.id));
      const existingObjectsSnapshot = await getDocs(existingObjectsQuery);
      for (const objectDoc of existingObjectsSnapshot.docs) {
        await deleteDoc(objectDoc.ref);
      }

      // Delete existing members for this group (old data cleanup)
      const existingMembersQuery = query(membersCollection, where('groupId', '==', groupData.id));
      const existingMembersSnapshot = await getDocs(existingMembersQuery);
      for (const memberDoc of existingMembersSnapshot.docs) {
        await deleteDoc(memberDoc.ref);
      }

      // Create the group
      await setDoc(groupRef, {
        ...groupData,
        captainId: captainClerkId,
        createdAt: now,
        updatedAt: now,
        lastActivityAt: sevenDaysAgo, // Set to recent for trending
      });

      // Add captain as a member (real user membership record)
      const captainMemberId = uuidv4();
      const captainMemberRef = doc(membersCollection, captainMemberId);
      await setDoc(captainMemberRef, {
        groupId: groupData.id,
        clerkId: captainClerkId,
        email: captainEmail,
        name: 'Captain',
        imageUrl: null,
        role: 'captain',
        status: 'accepted',
        invitedAt: now,
        respondedAt: now,
      });

      // Add mock objects (the things to be rated)
      const objects = mockObjects[groupData.id] || [];
      let addedObjects = 0;
      for (const obj of objects) {
        try {
          const objectId = uuidv4();
          const objectRef = doc(objectsCollection, objectId);
          await setDoc(objectRef, {
            groupId: groupData.id,
            name: obj.name,
            description: obj.description || null,
            imageUrl: null,
            objectType: 'text',
            linkUrl: null,
            category: obj.category,
            disabledMetricIds: [],
            enabledMetricIds: [],
            visibleInGraph: true,
            ratingMode: 'group',
            claimedByClerkId: null,
            claimedByName: null,
            claimedByImageUrl: null,
            claimStatus: 'unclaimed',
            createdAt: now,
            updatedAt: now,
          });
          addedObjects++;
        } catch (objectError) {
          console.error(`Failed to add object ${obj.name}:`, objectError);
        }
      }

      createdGroups.push({
        id: groupData.id,
        name: groupData.name,
        objectCount: addedObjects,
        expectedObjects: objects.length,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Created ${createdGroups.length} mock groups with objects`,
      groups: createdGroups,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint with { captainEmail, captainClerkId } to seed mock groups',
  });
}
