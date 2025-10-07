// Messages for each chat
const chatMessages = {
  '1': [ // Sarah Johnson
    {
      id: '1',
      message: 'Can i see ur place?',
      sender: 'user',
      avatar: '/images/demo/daisy.svg',
      timestamp: '10:30 AM',
      isImage: false
    },
    {
      id: '2',
      message: 'Nice!',
      sender: 'user',
      avatar: '/images/demo/daisy.svg',
      timestamp: '10:31 AM',
      isImage: false
    },
    {
      id: '3',
      message: 'So i can book an appointment now?',
      sender: 'user',
      avatar: '/images/demo/daisy.svg',
      timestamp: '10:32 AM',
      isImage: false
    },
    {
      id: '4',
      message: 'Here!',
      sender: 'other',
      avatar: '/images/demo/daisy.svg',
      timestamp: '10:33 AM',
      isImage: false
    },
    {
      id: '5',
      message: '',
      sender: 'other',
      avatar: '/images/demo/daisy.svg',
      timestamp: '10:34 AM',
      isImage: true,
      imageUrl: '/images/demo/bubba.svg'
    }
  ],
  '2': [ // Mike Chen
    {
      id: '1',
      message: 'Hello! How are you doing?',
      sender: 'other',
      avatar: '/images/demo/bubba.svg',
      timestamp: '9:15 AM',
      isImage: false
    },
    {
      id: '2',
      message: 'I am doing great! Thanks for asking',
      sender: 'user',
      avatar: '/images/demo/bubba.svg',
      timestamp: '9:16 AM',
      isImage: false
    },
    {
      id: '3',
      message: 'I love your cat!',
      sender: 'other',
      avatar: '/images/demo/bubba.svg',
      timestamp: '9:17 AM',
      isImage: false
    },
    {
      id: '4',
      message: 'Thank you! She is very friendly',
      sender: 'user',
      avatar: '/images/demo/bubba.svg',
      timestamp: '9:18 AM',
      isImage: false
    },
    {
      id: '5',
      message: 'Hello World!!!',
      sender: 'user',
      avatar: '/images/demo/bubba.svg',
      timestamp: '9:20 AM',
      isImage: false
    }
  ],
  
  '4': [ // David Brown
    {
      id: '1',
      message: 'Good morning!',
      sender: 'other',
      avatar: '/images/demo/isom.svg',
      timestamp: '7:30 AM',
      isImage: false
    },
    {
      id: '2',
      message: 'Morning! How is your day?',
      sender: 'user',
      avatar: '/images/demo/isom.svg',
      timestamp: '7:31 AM',
      isImage: false
    },
    {
      id: '3',
      message: 'yeah my home is so big',
      sender: 'other',
      avatar: '/images/demo/isom.svg',
      timestamp: '7:32 AM',
      isImage: false
    },
    {
      id: '4',
      message: 'That sounds amazing!',
      sender: 'user',
      avatar: '/images/demo/isom.svg',
      timestamp: '7:33 AM',
      isImage: false
    }
  ]
};

// Default messages (for backward compatibility)
const sampleMessages = chatMessages['1'] || [];

export default sampleMessages;
export { chatMessages };