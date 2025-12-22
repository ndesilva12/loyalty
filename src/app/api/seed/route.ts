import { NextResponse } from 'next/server';
import { collection, doc, setDoc, getDocs, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Mock items for each group
const mockItems: Record<string, Array<{ name: string; category: string | null; description?: string }>> = {
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

      // First, delete all existing members in this group to start fresh
      const existingMembersSnapshot = await getDocs(collection(db, 'groups', groupData.id, 'members'));
      for (const memberDoc of existingMembersSnapshot.docs) {
        await deleteDoc(memberDoc.ref);
      }

      await setDoc(groupRef, {
        ...groupData,
        captainId: captainClerkId,
        createdAt: now,
        updatedAt: now,
        lastActivityAt: sevenDaysAgo, // Set to recent for trending
      });

      // Add captain as a member
      const memberRef = doc(collection(db, 'groups', groupData.id, 'members'));
      await setDoc(memberRef, {
        groupId: groupData.id,
        userId: captainClerkId,
        clerkId: captainClerkId,
        email: captainEmail,
        name: 'Captain',
        imageUrl: null,
        placeholderImageUrl: null,
        description: null,
        status: 'accepted',
        visibleInGraph: true,
        isCaptain: true,
        invitedAt: now,
        respondedAt: now,
        itemType: 'user',
        linkUrl: null,
        itemCategory: null,
        displayMode: 'user',
        customName: null,
        customImageUrl: null,
        ratingMode: 'group',
      });

      // Add mock items to the group
      const items = mockItems[groupData.id] || [];
      for (const item of items) {
        const itemRef = doc(collection(db, 'groups', groupData.id, 'members'));
        await setDoc(itemRef, {
          groupId: groupData.id,
          userId: `item_${item.name.toLowerCase().replace(/\s+/g, '_')}`,
          clerkId: null,
          email: null,
          name: item.name,
          imageUrl: null,
          placeholderImageUrl: null,
          description: item.description || null,
          status: 'placeholder',
          visibleInGraph: true,
          isCaptain: false,
          invitedAt: now,
          respondedAt: null,
          itemType: 'text',
          linkUrl: null,
          itemCategory: item.category,
          displayMode: 'custom',
          customName: null,
          customImageUrl: null,
          ratingMode: 'group',
        });
      }

      createdGroups.push({
        id: groupData.id,
        name: groupData.name,
        itemCount: items.length,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Created ${createdGroups.length} mock groups`,
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
