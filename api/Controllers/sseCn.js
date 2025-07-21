import { addClient } from "../sse.js";
import Device from "../Models/deviceMd.js";
import DeviceData from "../Models/deviceDataMd.js";

class SSEController {
  static async streamUserData(req, res) {
    const { userId } = req.params;

      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });
      addClient(userId,res)
    try {
        const devices=await Device.findByUserId(userId)
        if(!devices){
            return res.status(400).json({
                success:false,
                message:'دستگاهی یافت نشد'
            })}
        for(const device of devices){
            const latestData=await DeviceData.findLatestByDeviceId(device.id)
             if (latestData) {
          res.write(`data: ${JSON.stringify(latestData)}\n\n`);
        }
        }
      
    } catch (error) {
        console.error('Error sending initial data:', error);
    }
  }
}


export default SSEController
