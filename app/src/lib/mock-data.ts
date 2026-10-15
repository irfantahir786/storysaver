import type { ProfileData } from '@/lib/types';

const mockProfiles: Record<string, ProfileData> = {
  "examples": {
    handle: "examples",
    name: "Example User",
    avatarUrl: "https://assets.about.me/background/users/i/r/f/irfantahir786_1559993886_265.jpg",
    bio: "Just a demo user profile for SnapSaver. Sharing moments from a digital life.",
    stats: {
      posts: 125,
      followers: "5.4M",
      following: 320,
    },
    posts: [
      { id: 'p1', type: 'photo', url: 'https://assets.about.me/background/users/i/r/f/irfantahir786_1559993886_265.jpg', thumbnailUrl: 'https://assets.about.me/background/users/i/r/f/irfantahir786_1559993886_265.jpg' },
      { id: 'p2', type: 'video', url: 'https://videos.pexels.com/video-files/8154854/uhd_25fps.mp4', thumbnailUrl: 'https://placehold.co/500x500.png' },
      { id: 'p3', type: 'photo', url: 'https://assets.about.me/background/users/i/r/f/irfantahir786_1559993886_265.jpg', thumbnailUrl: 'https://assets.about.me/background/users/i/r/f/irfantahir786_1559993886_265.jpg' },
      { id: 'p4', type: 'photo', url: 'https://assets.about.me/background/users/i/r/f/irfantahir786_1559993886_265.jpg', thumbnailUrl: 'https://assets.about.me/background/users/i/r/f/irfantahir786_1559993886_265.jpg' },
      { id: 'p5', type: 'photo', url: 'https://assets.about.me/background/users/i/r/f/irfantahir786_1559993886_265.jpg', thumbnailUrl: 'https://assets.about.me/background/users/i/r/f/irfantahir786_1559993886_265.jpg' },
      { id: 'p6', type: 'video', url: 'https://videos.pexels.com/video-files/8154854/uhd_25fps.mp4', thumbnailUrl: 'https://placehold.co/500x500.png' },
      { id: 'p7', type: 'photo', url: 'https://assets.about.me/background/users/i/r/f/irfantahir786_1559993886_265.jpg', thumbnailUrl: 'https://assets.about.me/background/users/i/r/f/irfantahir786_1559993886_265.jpg' },
      { id: 'p8', type: 'photo', url: 'https://assets.about.me/background/users/i/r/f/irfantahir786_1559993886_265.jpg', thumbnailUrl: 'https://assets.about.me/background/users/i/r/f/irfantahir786_1559993886_265.jpg' },
    ],
    stories: [
      { id: 's1', type: 'photo', url: 'https://assets.about.me/background/users/i/r/f/irfantahir786_1559993886_265.jpg', thumbnailUrl: 'https://assets.about.me/background/users/i/r/f/irfantahir786_1559993886_265.jpg' },
      { id: 's2', type: 'video', url: 'https://videos.pexels.com/video-files/8154854/uhd_25fps.mp4', thumbnailUrl: 'https://placehold.co/500x500.png' },
      { id: 's3', type: 'photo', url: 'https://assets.about.me/background/users/i/r/f/irfantahir786_1559993886_265.jpg', thumbnailUrl: 'https://assets.about.me/background/users/i/r/f/irfantahir786_1559993886_265.jpg' },
    ]
  }
};

export const fetchInstagramData = (handle: string): Promise<ProfileData> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const normalizedHandle = handle.toLowerCase();
      if (mockProfiles[normalizedHandle]) {
        resolve(mockProfiles[normalizedHandle]);
      } else if (normalizedHandle) {
         const newProfile: ProfileData = {
          handle: normalizedHandle,
          name: normalizedHandle.charAt(0).toUpperCase() + normalizedHandle.slice(1),
          avatarUrl: `https://assets.about.me/background/users/i/r/f/irfantahir786_1559993886_265.jpg`,
          bio: `This is a dynamically generated profile for ${normalizedHandle}.`,
          stats: {
            posts: Math.floor(Math.random() * 500),
            followers: `${(Math.random() * 10).toFixed(1)}M`,
            following: Math.floor(Math.random() * 1000),
          },
          posts: Array.from({ length: 12 }, (_, i) => ({
            id: `p${i + 1}`,
            type: Math.random() > 0.3 ? 'photo' : 'video',
            url: Math.random() > 0.3 ? 'https://assets.about.me/background/users/i/r/f/irfantahir786_1559993886_265.jpg' : 'https://videos.pexels.com/video-files/8154854/uhd_25fps.mp4',
            thumbnailUrl: Math.random() > 0.3 ? 'https://assets.about.me/background/users/i/r/f/irfantahir786_1559993886_265.jpg' : 'https://placehold.co/500x500.png',
          })),
          stories: Array.from({ length: 4 }, (_, i) => ({
            id: `s${i + 1}`,
            type: Math.random() > 0.5 ? 'photo' : 'video',
            url: Math.random() > 0.5 ? 'https://assets.about.me/background/users/i/r/f/irfantahir786_1559993886_265.jpg' : 'https://videos.pexels.com/video-files/8154854/uhd_25fps.mp4',
            thumbnailUrl: Math.random() > 0.5 ? 'https://assets.about.me/background/users/i/r/f/irfantahir786_1559993886_265.jpg' : 'https://placehold.co/500x500.png',
          })),
        };
        resolve(newProfile);
      }
      else {
        reject(new Error("User not found. Try 'examples'."));
      }
    }, 1500);
  });
};
