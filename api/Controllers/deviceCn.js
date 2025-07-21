import Device from "../Models/deviceMd.js";
import User from "../Models/userMd.js";

class DeviceController {
  // static async createDevice(req, res) {
  //   try {
  //     const { userId, deviceName } = req.body;
      
  //     const user = await User.findById(userId);
  //     if (!user) {
  //       return res.status(404).json({ 
  //         success: false,
  //         message: 'کاربر یافت نشد' 
  //       });
  //     }

  //     const deviceId = await Device.create({ userId, deviceName });
  //     const device=await Device.findById(deviceId)
      
  //     return res.status(201).json({
  //       success: true,
  //       data: device,
  //       message: 'دستگاه با موفقیت ساخته شد'
  //     });
      
  //   } catch (error) {
  //     console.error('خطای داخلی سرور', error);
  //     res.status(500).json({ 
  //       success: false,
  //       message: 'خطای داخلی سرور' 
  //     });
  //   }
  // }

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

  // static async deleteDevice(req, res) {
  //   try {
  //     const { id } = req.params;
  //       if(userId!=req.userId){
  //       return res.status(401).json({
  //         success:false,
  //         message:'شما اجازه دسترسی ندارید'
  //       })
  //     }
  //     const device = await Device.findById(id);
  //     if (!device) {
  //       return res.status(404).json({
  //         success: false,
  //         message: 'دستگاه یافت نشد'
  //       });
  //     }
      
  //     await Device.delete(id);
      
  //     return res.status(200).json({
  //       success: true,
  //       message: 'دستگاه با موفقیت حذف شد'
  //     });
      
  //   } catch (error) {
  //     console.error('خطای داخلی سرور', error);
  //     res.status(500).json({ 
  //       success: false,
  //       message: 'خطای داخلی سرور' 
  //     });
  //   }
  // }
}

export default DeviceController;