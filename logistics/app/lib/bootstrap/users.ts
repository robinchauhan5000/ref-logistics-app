const adminEmail = process.env.LOGISTICS_ADMIN_EMAIL;
const env = process.env.NODE_ENV || 'development'; // By default development environment is picked
// default users fordevelopment and staging/production environment
const users =
  env === 'development'
    ? [
        {
          name: 'Super User',
          firstName: 'Superr',
          lastName: 'User',
          username: adminEmail,
          email: adminEmail,
          roleName: 'Super Admin',
          template: 'Super Admin',
          gender: 'Male',
          nationality: 'Indian',
          dateOfBirth: '1996-03-04',
          mobile: '+918146448923',
          password: 'Dummy@pwd29!',
        },
      ]
    : [
        {
          name: 'Super User',
          firstName: 'Super',
          lastName: 'User',
          username: adminEmail,
          email: adminEmail,
          roleName: 'Super Admin',
          template: 'Super Admin',
          gender: 'Male',
          nationality: 'Indian',
          dateOfBirth: '1996-03-04',
          mobile: '+918146448923',
          password: 'Dummy@pwd29!',
        },
      ];

export default users;
