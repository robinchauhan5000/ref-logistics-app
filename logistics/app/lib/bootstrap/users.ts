const adminEmail = process.env.LOGISTICS_ADMIN_EMAIL;
const adminName = process.env.LOGISTICS_ADMIN_NAME;
const adminFirstName= process.env.LOGISTICS_ADMIN_FIRST_NAME;
const adminSecondUserFirstName= process.env.LOGISTICS_ADMIN_SECOND_USER_FIRST_NAME;
const adminPassword = process.env.LOGISTICS_ADMIN_PASSWORD;

const env = process.env.NODE_ENV || 'development'; // By default development environment is picked
// default users fordevelopment and staging/production environment
const users =
  env === 'development'
    ? [
        {
          name: adminName || 'ONDC Admin',
          firstName: adminFirstName || 'ONDC',
          lastName: 'Admin',
          username: adminEmail,
          email: adminEmail,
          roleName: 'Super Admin',
          template: 'Super Admin',
          gender: 'Male',
          nationality: 'Indian',
          dateOfBirth: '1996-03-04',
          mobile: '+918146448923',
          password: adminPassword || 'ONDC@1234!',
        },
      ]
    : [
        {
          name: adminSecondUserFirstName|| 'ONDC',
          firstName: adminFirstName || 'ONDC',
          lastName: 'Admin',
          username: adminEmail,
          email: adminEmail,
          roleName: 'Super Admin',
          template: 'Super Admin',
          gender: 'Male',
          nationality: 'Indian',
          dateOfBirth: '1996-03-04',
          mobile: '+918146448923',
          password: adminPassword || 'ONDC@1234!',
        },
      ];

export default users;
