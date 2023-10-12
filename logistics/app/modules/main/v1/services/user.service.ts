/* eslint-disable no-useless-catch */
import MESSAGES from '../../../../lib/utils/messages';
import { encryptPIN } from '../../../../lib/utils/utilityFunctions';
import {
  NoRecordFoundError,
  DuplicateRecordFoundError,
  UnauthorisedError,
  BadRequestParameterError,
} from '../../../../lib/errors/index';
import { v1 as uuidv1 } from 'uuid';
import User from '../../models/user.model';
import Role from '../../models/role.model';
// import sendNotificationEmail from '../../../../lib/email/sendEmail'
import mergedEnvironmentConfig from '../../../../config/env.config';
import ServiceApi from '../../../../lib/utils/serviceApi';
import InternalServerError from '../../../../lib/errors/internal-server-error.error';
import Agent from '../../models/agent.model';
import Settings from '../../models/settings.model';
import Task from '../../models/task.model';
import Issue from '../../models/issue.model';
// const notificationServiceURL = mergedEnvironmentConfig.default.intraServiceApiEndpoints.notification

const mainSiteURL = mergedEnvironmentConfig.default.mainSiteURL;

interface IRole {
  name: string;
  _id: string;
}
interface IPricePerDistance {
  unit: string;
  value: number;
}
interface IPricePerWeigth {
  unit: string;
  value: number;
  type: string;
}
interface ISettings {
  pricePerDistance: IPricePerDistance;
  pricePerWeight: IPricePerWeigth;
}
interface ICurrentUser {
  agentId: string | undefined;
  _id: string;
  name: string;
  mobile: string;
  email: string;
  role: IRole;
  enabled: number;
  isAgentDetailsUpdated?: boolean;
  password?: string;
  settings: ISettings;
  firstName: string;
  lastName: string;
}

interface IUser {
  id: string;
}
class UserService {
  /**
   * Create a new user
   * @param {Object} data
   */
  async create(data: any) {
    try {
      console.log('data to bootstrap--->', data);
      // Find user by email or mobile
      const query = { email: data.email };
      const userExist = await User.findOne(query);
      if (userExist) {
        return userExist;
      }

      if (!data.password) data.password = Math.floor(100000 + Math.random() * 900000);

      console.log(`password--------------------------------: ${data.password}`);

      data.email = data.email.toLowerCase();
      //const password = data.password;
      const password = data.password; //FIXME: reset to default random password once SES is activated

      console.log(`password-${password}`);

      const role = await Role.findOne({ name: data.role });

      data.password = await encryptPIN('' + password);
      data.enabled = 1;
      data.lastLoginAt = null;
      data.id = uuidv1();
      data.createdAt = Date.now();
      data.updatedAt = Date.now();
      const user = new User();
      (user.firstName = data.firstName), (user.lastName = data.lastName), (user.name = data.name);
      user.mobile = data.mobile;
      user.email = data.email;
      user.enabled = data.enabled;
      user.isSystemGeneratedPassword = true;

      user.password = data.password;
      user.role = role?._id;
      const savedUser = await user.save();
      console.log({ mainSiteURL });
      //const organization = await Organization.findOne({_id:data.organizationId},{name:1});
      const mailData = {
        emailTemplate: 'welcome.ejs.html',
        payload: {
          password,
          username: data.name,
          mainSiteLink: mainSiteURL,
          emailRecipients: data.email,
          subject: 'ONDC logistics',
        },
      };
      const currentUser: IUser = { id: savedUser._id };
      ServiceApi.sendEmail(mailData, currentUser, '');
      return savedUser;
    } catch (error: any) {
      if (error.statusCode === 404) throw new NoRecordFoundError(MESSAGES.MEMBER_NOT_EXISTS);
      throw error;
    }
  }

  async invite(data: any, userId: string): Promise<boolean> {
    try {
      const newDocuments: any = [];
      const existingDocuments: any = [];
      let currentUser: IUser;
      for (const doc of data) {
        const existingDocument: any = await User.findOne({ $or: [{ email: doc.email }, { mobile: doc.mobile }] });
        if (!existingDocument) {
          newDocuments.push(doc);
        } else {
          const updatedUser: any = await User.findOneAndUpdate(
            { email: doc.email, enabled: 0 },
            { $set: { invitationSendTime: Date.now() } },
            { new: true },
          );
          existingDocuments.push(doc);
          if (updatedUser) {
            const data = {
              emailTemplate: 'invitation.ejs.html',
              payload: {
                username: updatedUser.name,
                emailRecipients: updatedUser.email,
                subject: 'ONDC logistics',
                verificationLink: `${mainSiteURL}/create-password/${updatedUser._id}`,
              },
            };
            //send email
            currentUser = { id: updatedUser._id };
            ServiceApi.sendEmail(data, currentUser, '');
          }
        }
      }

      if (existingDocuments?.length === 1) {
        const name = existingDocuments[0]?.name;
        throw new DuplicateRecordFoundError(name + ' already exist.');
      } else if (existingDocuments?.length > 1) {
        throw new DuplicateRecordFoundError('Members already exist.');
      }

      if (newDocuments.length || newDocuments.length > 0) {
        //add admin role
        const role: any = await Role.findOne({ name: 'Admin' });
        const newUsers = newDocuments?.map((doc: any) => {
          return { ...doc, role: role._id, invitationSendTime: Date.now(), addedBy: userId };
        });
        const usersData = await User.insertMany(newUsers);
        //send emails
        for (const admin of usersData) {
          const data = {
            emailTemplate: 'invitation.ejs.html',
            payload: {
              username: admin.name,
              emailRecipients: admin.email,
              subject: 'ONDC logistics',
              verificationLink: `${mainSiteURL}/create-password/${admin._id}`,
            },
          };
          //send email
          currentUser = { id: admin._id as string };
          ServiceApi.sendEmail(data, currentUser, '');
        }
      }

      return true;
    } catch (err: any) {
      throw err;
    }
  }

  async inviteAgent(data: any): Promise<any> {
    try {
      const existingUser: any = await User.findOne({
        $or: [{ email: data.email.toLowerCase() }, { mobile: data.mobile }],
      }).populate('role');
      if (existingUser) {
        throw new DuplicateRecordFoundError(`Member already exist as ${existingUser.role.name}.`);
      }

      const role: any = await Role.findOne({ name: 'Agent' });
      if (data.password) {
        data.password = await encryptPIN(data.password);
      }

      const userData = {
        name: data.name ? data.name : data.firstName,
        email: data.email,
        mobile: data.mobile,
        firstName: data.firstName,
        lastName: data.lastName,
        role: role._id,
        invitationSendTime: Date.now(),
        password: data?.password ? data.password : '',
        enabled: data?.enabled ? data.enabled : 0,
        isSystemGeneratedPassword: data?.isSystemGeneratedPassword ? data.isSystemGeneratedPassword : false,
      };

      const user = new User(userData);
      const savedUser = await user.save();

      if (savedUser) {
        const mailData = {
          emailTemplate: 'invitation.ejs.html',
          payload: {
            username: savedUser.name,
            emailRecipients: savedUser.email,
            subject: 'ONDC logistics',
            verificationLink: `${mainSiteURL}/create-password/${savedUser._id}`,
          },
        };
        const agentData = {
          ...data,
          userId: savedUser._id,
        };
        const agent = new Agent(agentData);
        const savedAgent = await agent.save();
        const currentUser = { id: savedAgent._id };
        ServiceApi.sendEmail(mailData, currentUser, '');
      }

      return savedUser;
    } catch (error) {
      throw error;
    }
  }

  async getProfile(userId: string): Promise<ICurrentUser> {
    try {
      const currentUser: ICurrentUser | null = await User.findOne({ _id: userId })
        .populate({ path: 'role', select: 'name' })
        .select('name role email enabled mobile')
        .lean();
      const settings: ISettings | null = await Settings.findOne({ userId });
      if (currentUser) {
        return { ...currentUser, settings: (settings as any) || {} };
      } else {
        throw new NoRecordFoundError(MESSAGES.MEMBER_NOT_EXISTS);
      }
    } catch (error) {
      throw error;
    }
  }

  async getDashboardData(userId: string, skip: number, limit: number): Promise<any> {
    try {
      const roles = await Role.find();
      const superAdmin = roles.filter((role) => role.name === 'Super Admin');
      const superAdminId = superAdmin[0]._id;
      const query = { _id: { $ne: userId }, role: { $ne: superAdminId } };
      const adminData = await User.find(query)
        .populate({ path: 'role', select: 'name' })
        .select('name role email enabled mobile')
        .skip(skip)
        .limit(limit);
      const totalAdminCount = await User.find(query).count();
      const totalTaskCount = await Task.find({ is_confirmed: true }).count();
      const totalIssueCount = await Issue.find().count();
      const totalDrivers = await Agent.find();
      if (adminData) {
        return {
          adminData,
          totalAdminCount,
          totalTaskCount,
          totalIssueCount,
          totalDriverCount: totalDrivers.length,
          onlineDriversCount: totalDrivers.filter((agent: any) => agent.isOnline).length,
        };
      } else {
        throw new NoRecordFoundError(MESSAGES.MEMBER_NOT_EXISTS);
      }
    } catch (error: any) {
      if (error.status === 404 || error.status === 401) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async getUserslist(userId: string, skip: number, limit: number): Promise<any> {
    try {
      const user = await User.findById({ _id: userId });
      if (!user) {
        throw new NoRecordFoundError(MESSAGES.MEMBER_NOT_EXISTS);
      }

      const roles = await Role.find();
      const superAdmin = roles.filter((role) => role.name === 'Super Admin');
      const superAdminId = superAdmin[0]._id;
      const role = await Role.findOne({ _id: user?.role });
      const query = role?.name === 'Super Admin' ? { role: { $ne: superAdminId } } : { addedBy: userId };
      // role?.name === 'Super Admin' ? {role:{$ne:superAdminId}} : { addedBy: userId, _id: { $ne: userId }, role: { $ne: superAdminId } };
      const usersList = await User.find(query)
        .populate({ path: 'role', select: 'name' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      const usersCount = await User.find(query).count();
      if (usersList) {
        return { usersList, usersCount };
      } else {
        throw new NoRecordFoundError(MESSAGES.MEMBER_NOT_EXISTS);
      }
    } catch (error: any) {
      if (error.status === 404 || error.status === 401) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async getDriverslist(userId: string, skip?: string, limit?: string, searchString?: any): Promise<any> {
    try {
      const user = await User.findById({ _id: userId });
      if (!skip) skip = '0';
      if (!limit) limit = '10';
      if (!user) {
        throw new NoRecordFoundError(MESSAGES.MEMBER_NOT_EXISTS);
      }

      const role = await Role.findOne({ _id: user?.role });
      if (role?.name === 'Super Admin' || role?.name === 'Admin') {
        // const drivers = await Agent.find()
        //   .populate({ path: 'userId', select: 'name mobile enabled email' })
        //   .sort({ createdAt: -1 })
        //   .skip(skip)
        //   .limit(limit)
        //   .select('isOnline userId');

        const nameFilter = searchString
          ? {
              $or: [
                { 'userId.name': { $regex: searchString, $options: 'i' } },
                {
                  'userId.mobile': { $regex: searchString, $options: 'i' },
                },
                { 'userId.email': { $regex: searchString, $options: 'i' } },
              ],
            }
          : {};
        const drivers: any = await Agent.aggregate([
          {
            $lookup: {
              from: 'tasks',
              localField: '_id',
              foreignField: 'assignee',
              as: 'tasks',
            },
          },
          {
            $addFields: {
              completedTasksCount: {
                $size: {
                  $filter: {
                    input: '$tasks',
                    as: 'task',
                    cond: {
                      $in: ['$$task.status', ['RTO-Delivered', 'RTO-Disposed', 'Order-delivered']],
                    },
                  },
                },
              },
              tasksInProgressCount: {
                $size: {
                  $filter: {
                    input: '$tasks',
                    as: 'task',
                    cond: {
                      $in: [
                        '$$task.status',
                        ['Searching-for-Agent', 'Agent-assigned', 'Order-picked-up', 'Out-for-delivery'],
                      ],
                    },
                  },
                },
              },
              totalTasks: { $size: '$tasks' },
              driverCurrentStatus: {
                $switch: {
                  branches: [
                    {
                      case: {
                        $and: [
                          { $eq: ['$isAvailable', false] },
                          { $eq: [{ $arrayElemAt: ['$tasks.is_confirmed', 0] }, true] },
                        ],
                      },
                      then: 'Locked',
                    },
                    {
                      case: {
                        $and: [
                          { $eq: ['$isAvailable', false] },
                          { $eq: [{ $arrayElemAt: ['$tasks.is_confirmed', 0] }, false] },
                        ],
                      },
                      then: 'SoftLocked',
                    },
                    {
                      case: {
                        $eq: ['$isAvailable', false],
                      },
                      then: 'Unavailable',
                    },
                  ],
                  default: 'Available',
                },
              },
            },
          },
          {
            $project: {
              isOnline: 1,
              isAvailable: 1,
              userId: 1,
              completedTasksCount: 1,
              tasksInProgressCount: 1,
              totalTasks: 1,
              driverCurrentStatus: 1,
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'userId',
            },
          },
          {
            $unwind: '$userId',
          },
          {
            $project: {
              isOnline: 1,
              isAvailable: 1,
              'userId.name': 1,
              'userId.mobile': 1,
              'userId.enabled': 1,
              'userId.email': 1,
              'userId.isAccountLocked': 1,
              completedTasksCount: 1,
              tasksInProgressCount: 1,
              totalTasks: 1,
              driverCurrentStatus: 1,
            },
          },
          {
            $match: nameFilter,
          },
          {
            $facet: {
              drivers: [
                {
                  $sort: { createdAt: -1 },
                },
                {
                  $skip: parseInt(skip),
                },
                {
                  $limit: parseInt(limit),
                },
              ],
              count: [
                {
                  $count: 'count',
                },
              ],
            },
          },
        ]);

        // const driverCount = drivers[0].count[0].count;
        const driverList = drivers[0]?.drivers;
        const driverCount = drivers[0]?.count[0]?.count;
        if (!driverList) {
          throw new NoRecordFoundError(MESSAGES.USER_NOT_EXISTS);
        }
        return { driverList, driverCount };
      } else {
        throw new UnauthorisedError(MESSAGES.UNAUTHORISED_ERROR);
      }
    } catch (error: any) {
      console.log('ERROR ', error);
      if (error.status === 404 || error.status === 401) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async getAdminsList(userId: string, skip: number, limit: number, searchString?: string | undefined): Promise<any> {
    try {
      const user = await User.findById({ _id: userId });
      if (!user) {
        throw new NoRecordFoundError(MESSAGES.MEMBER_NOT_EXISTS);
      }

      const roles = await Role.find();
      const superAdmin = roles.filter((role) => role.name === 'Super Admin');
      const agent = roles.filter((role) => role.name === 'Agent');
      const agentId = agent[0]._id;
      const superAdminId = superAdmin[0]._id;
      const role = await Role.findOne({ _id: user?.role });
      if (role?.name === 'Super Admin' || role?.name === 'Admin') {
        const query =
          role?.name === 'Super Admin'
            ? {
                _id: { $ne: userId },
                role: { $ne: agentId },
                $or: [
                  { email: { $regex: searchString, $options: 'i' } },
                  { mobile: { $regex: searchString, $options: 'i' } },
                  { name: { $regex: searchString, $options: 'i' } },
                ],
              }
            : {
                _id: { $ne: userId },
                $and: [{ role: { $ne: superAdminId } }, { role: { $ne: agentId } }],
                $or: [
                  { email: { $regex: searchString, $options: 'i' } },
                  { mobile: { $regex: searchString, $options: 'i' } },
                  { name: { $regex: searchString, $options: 'i' } },
                ],
              };
        const admins = await User.find(query)
          .populate({ path: 'role', select: 'name' })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);

        const adminCount = await User.find(query).count();
        if (!admins) {
          throw new NoRecordFoundError(MESSAGES.USER_NOT_EXISTS);
        }

        return { admins, adminCount };
      } else {
        throw new UnauthorisedError(MESSAGES.UNAUTHORISED_ERROR);
      }
    } catch (error: any) {
      if (error.status === 404 || error.status === 401) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async userSettings(userSettings: any) {
    try {
      const setting = await Settings.findOneAndUpdate({ userId: userSettings.userId }, userSettings, {
        upsert: true,
        new: true,
      });
      return setting;
    } catch (error: any) {
      console.log({ error });
      throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async updateProfile(userId: string, data: any) {
    try {
      if (data?.email || data?.password || data?.mobile) {
        throw new BadRequestParameterError(MESSAGES.UPDATE_PROFILE_ERROR);
      }

      await User.findByIdAndUpdate({ _id: userId }, { $set: data });
      return true;
    } catch (error: any) {
      if (error.status === 404 || error.status === 401 || error.status === 400) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async alterAdmin(userId: string, adminId: string, enabled: number) {
    try {
      const user: any = await User.findById(userId);
      const role = await Role.findOne({ _id: user?.role });
      if (role?.name === 'Super Admin' || role?.name === 'Admin') {
        const admin = await User.findById(adminId);
        if (!admin) {
          throw new NoRecordFoundError(MESSAGES.USER_NOT_EXISTS);
        }

        await User.findByIdAndUpdate(adminId, { $set: { enabled } }, { new: true });
      } else {
        throw new UnauthorisedError(MESSAGES.UNAUTHORISED_ERROR);
      }
    } catch (error: any) {
      if (error.status === 404 || error.status === 401 || error.status === 400 || error.status === 403) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }
}

export default UserService;
