const env = process.env.NODE_ENV || 'development'; // By default development environment is picked
const applicationSupport =
  env === 'development'
    ? [
        {
          name: 'WIL Support',
          email: 'accounts@thewitslab.com',
          uri: 'http://t.me/supportBot',
          phone: '8755555551',
        },
      ]
    : [
        {
          name: 'Puneet',
          email: 'accounts@thewitslab.com',
          uri: 'http://t.me/supportBot',
          phone: '8755555551',
        },
      ];

export default applicationSupport;
