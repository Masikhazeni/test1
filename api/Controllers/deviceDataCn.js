import Device from "../Models/deviceMd.js";
import DeviceData from "../Models/deviceDataMd.js";
import { sendToUser } from "../sse.js";

class DeviceDataController {
  static async storeData(req, res) {
    try {
      const { device, payload } = req.body;
      const { temperature, humidity ,date} = payload;
      const deviced = await Device.findById(device);
      if (!deviced) {
        return res
          .status(404)
          .json({ success: false, message: "دستگاه یافت نشد" });
      }
      const data = await DeviceData.creat({ device, temperature, humidity ,date});

      // const newData = await DeviceData.findLatestByDeviceId(device);
      // sendToUser(deviced.userId, newData);         چون با poolerهر 15 دقیقه داده های به روز ازسال میشن دیگ احتیاجی باین نیست
      res.status(201).json({
        success: true,
        data,
        message: "اطلاعات با موفقیت ذخیره شد",
      });
    } catch (error) {
      console.error("خطای داخلی سرور", error);
      res.status(500).json({
        success: false,
        message: "خطای داخلی سرور",
      });
    }
  }




  static async getDeviceData(req, res) {
    try {
      const { deviceId } = req.params;
      const device = await Device.findById(deviceId);
      if (!device) {
        return res
          .status(404)
          .json({ success: false, message: "دستگاه یافت نشد" });
      }
      const data = await DeviceData.findByDeviceId(deviceId);

      res.status(201).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error("خطای داخلی سرور", error);
      res.status(500).json({
        success: false,
        message: "خطای داخلی سرور",
      });
    }
  }
  


  static async getUserDeviceData(req, res) {
  try {
    const { userId } = req.params;
    //  if(userId!=req.userId){
    //     return res.status(401).json({
    //       success:false,
    //       message:'شما اجازه دسترسی ندارید'
    //     })
    //   }

    const device = await Device.findByUserId(userId);
    
    if (!device) {
      return res.status(404).json({ 
        success: false, 
        message: "دستگاه یافت نشد" 
      });
    }

    const data = await DeviceData.findByUserId(userId);

    res.status(200).json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error("خطای داخلی سرور", error);
    res.status(500).json({
      success: false,
      message: "خطای داخلی سرور",
    });
  }
}
}

export default DeviceDataController;

// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTc1MzA4MzQxNH0.xk6nksRoD4nGvbUq2zMj1qmnMXMrLGW2lPqbXDIVfNA"
// id:2