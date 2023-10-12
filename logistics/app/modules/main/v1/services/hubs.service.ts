import Hub from '../../models/hubs.model';

class HubsService {
  async createHub(hubDetails: any) {
    try {
      const newHub = new Hub(hubDetails);
      const savedHub = await newHub.save();
      if (savedHub) {
        return true;
      } else {
        return false;
      }
    } catch (error: any) {
      return false;
    }
  }

  async getHubsList(skip: number, limit: number, searchString: string) {
    const queryObject = {
      $or: [
        { name: { $regex: searchString, $options: 'i' } },
        { 'addressDetails.pincode': { $regex: searchString, $options: 'i' } },
      ],
    };
    try {
      const hubList = await Hub.find(queryObject).skip(skip).limit(limit);
      const hubCount = await Hub.find(queryObject).count();
      if (hubList.length > 0) return { hubCount, hubList };
      return [];
    } catch (error: any) {
      return false;
    }
  }
  async getHubById(hubId: string) {
    try {
      const hubDetails = await Hub.findOne({ _id: hubId });
      if (hubDetails) {
        return hubDetails;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async updateHub(hubId: string, payload: {}) {
    try {
      const updatedDetails = await Hub.findOneAndUpdate({ _id: hubId }, { $set: payload });
      if (updatedDetails) {
        return updatedDetails;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async getHubByPincode(pincode: number) {
    try {
      const hubDetails = await Hub.findOne({ serviceablePincode: { $elemMatch: { $eq: pincode } } }).lean();
      console.log({ hubDetails });
      if (hubDetails) {
        return hubDetails;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  async deleteHub(hubId: string) {
    try {
      const deletedHub = await Hub.findOneAndDelete({ _id: hubId });
      if (deletedHub) {
        return deletedHub;
      }
      return false;
    } catch (error) {
      return false;
    }
  }
}

export default HubsService;
