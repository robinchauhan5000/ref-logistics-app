import { NextFunction, Request, Response } from 'express';
import HubsService from '../v1/services/hubs.service';

const hubService = new HubsService();

class HubController {
  public async createHub(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const newHub = await hubService.createHub(req.body);
      res.status(201).json({ message: 'Hub created successfully.', data: newHub });
    } catch (error) {
      next(error);
    }
  }

  public async getAllHubs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { skip, limit, search }: { skip?: number; limit?: number; search?: string } = req.query;
      const parsedSkip: number = skip || 0;
      const parsedLimit: number = limit || 10;
      const searchString: string = search || '';
      const hubList = await hubService.getHubsList(parsedSkip, parsedLimit,searchString);
      if (hubList) res.json({ message: ' List found', data: hubList });
      else {
        res.send({ message: ' List not found', data: hubList });
      }
    } catch (error) {
      next(error);
    }
  }

  public async getHubById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const hubId = req.params.id;

      const hubDetails = await hubService.getHubById(hubId);
      if (hubDetails) res.json({ message: 'Hub found', data: hubDetails });
      else {
        res.send({ message: 'Hub not found', data: hubDetails });
      }
    } catch (error) {
      next(error);
    }
  }

  public async updateHubDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const hubId = req.params.id;
      const payload = req.body;
      const updatedHub = await hubService.updateHub(hubId, payload);
      if (updatedHub) {
        res.send({ message: 'Status changed successfully.' });
      }
    } catch (error) {
      next(error);
    }
  }

  public async deleteHub(req: Request, res: Response, next: NextFunction) {
    try {
      const hubId = req.params.id;
      const deletedHub = await hubService.deleteHub(hubId);
      if (deletedHub) {
        res.send({ message: 'Hub deleted successfully.', data: deletedHub });
      }
    } catch (error) {
      next(error);
    }
  }

  //   public async getCityById(req: Request, res: Response): Promise<void> {
  //     try {
  //       const city = await City.findById(req.params.id);
  //       if (!city) {
  //         res.status(404).json({ error: 'City not found' });
  //       } else {
  //         res.json(city);
  //       }
  //     } catch (error) {
  //       res.status(500).json({ error: 'Failed to retrieve city' });
  //     }
  //   }

  //   public async updateCityById(req: Request, res: Response): Promise<void> {
  //     try {
  //       const updatedCity = await City.findByIdAndUpdate(req.params.id, req.body, {
  //         new: true,
  //       });
  //       if (!updatedCity) {
  //         res.status(404).json({ error: 'City not found' });
  //       } else {
  //         res.json(updatedCity);
  //       }
  //     } catch (error) {
  //       res.status(500).json({ error: 'Failed to update city' });
  //     }
  //   }

  //   public async deleteCityById(req: Request, res: Response): Promise<void> {
  //     try {
  //       const deletedCity = await City.findByIdAndDelete(req.params.id);
  //       if (!deletedCity) {
  //         res.status(404).json({ error: 'City not found' });
  //       } else {
  //         res.json(deletedCity);
  //       }
  //     } catch (error) {
  //       res.status(500).json({ error: 'Failed to delete city' });
  //     }
  //   }
}

export default HubController;
