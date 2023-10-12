import Roles from './roles';
import Users from './users';
import agents from './agents';
import Role from '../../modules/main/models/role.model';
import AuthenticationService from '../../modules/main/v1/services/authentication.service';
import UserService from '../../modules/main/v1/services/user.service';
import applicationSupport from './applicationSupport';
import hubsData from './hubs';
import ApplicationSettingService from '../../modules/main/v1/services/applicationSetting.service';
import HubService from '../../modules/main/v1/services/hubs.service';

const authenticationService = new AuthenticationService();
const userService = new UserService();
const applicationSettingService = new ApplicationSettingService();
const hubService = new HubService();

async function BootstrapData() {
  // 1: Create Roles
  try {
    const promiseArray = Roles.map(async (roleObj) => {
      return await authenticationService.createRole(roleObj);
    });
    await Promise.all(promiseArray);
  } catch (err) {
    console.log(err);
  }

  // 2: create agent
  try {
    const promiseArray = agents.map(async (agentObj: any) => {
      const userAgent = await userService.inviteAgent(agentObj);
      return userAgent;
    });
    await Promise.all(promiseArray);
  } catch (err) {
    console.log(err);
  }

  // 3: Create Users
  try {
    const promiseArray = Users.map(async (userObj: any) => {
      const roles = await Role.find({});
      const role = roles.find((role) => role.name === 'Super Admin');
      userObj.role = role?.name;
      userObj.enabled = 1;
      userObj.isSystemGeneratedPassword = true;
      const user = await userService.create(userObj);
      return user;
    });
    await Promise.all(promiseArray);
  } catch (err) {
    console.log(err);
  }

  try {
    const promiseArray = applicationSupport.map(async (obj: any) => {
      const applicationSupport = await applicationSettingService.createSetting(obj);
      return applicationSupport;
    });
    await Promise.all(promiseArray);
  } catch (err) {
    console.log(err);
  }
  // Create hubs
  try {
    const promiseArray = hubsData.map(async (obj: any) => {
      const hubs = await hubService.createHub(obj);
      return hubs;
    });
    await Promise.all(promiseArray);
  } catch (err) {
    console.log(err);
  }
}

export default BootstrapData;
