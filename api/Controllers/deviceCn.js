import Device from "../Models/deviceMd.js";
import User from "../Models/userMd.js";
import jwt from 'jsonwebtoken'

class DeviceController {
  static async getUserDevices(req, res) {
    try {
      const { userId } = req.params;
      if(userId!=req.userId){
        return res.status(401).json({
          success:false,
          message:'شما اجازه دسترسی ندارید'
        })
      }
      const devices = await Device.findByUserId(userId);
      
      if (!devices || devices.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'دستگاهی یافت نشد' 
        });
      }
      
      return res.status(200).json({
        success: true,
        data: devices
      });
      
    } catch (error) {
      console.error('خطای داخلی سرور', error);
      res.status(500).json({ 
        success: false,
        message: 'خطای داخلی سرور' 
      });
    }
  }
}

export default DeviceController;