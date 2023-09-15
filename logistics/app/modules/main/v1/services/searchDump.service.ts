import SearchDump from '../../models/searchResponseDump.model';
import InternalServerError from '../../../../lib/errors/internal-server-error.error';
import MESSAGES from '../../../../lib/utils/messages';

class SearchDumpService {
  async create(data: any): Promise<any> {
    try {
      const newDumpObject = new SearchDump(data);
      const savedObj = await newDumpObject.save();
      if (savedObj) {
        return true;
      }
    } catch (error: any) {
      if (error.status === 409) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async getSearchDump(deliveryId: string) {
    try {
      const dumpObj = await SearchDump.findOne({ delivery: deliveryId });
      return dumpObj;
    } catch (error: any) {
      if (error.status === 409) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }
}

export default SearchDumpService;
