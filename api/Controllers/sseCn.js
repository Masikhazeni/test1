import { addClient } from "../sse.js";
import Device from "../Models/deviceMd.js";
import DeviceData from "../Models/deviceDataMd.js";

class SSEController {
  static async streamUserData(req, res) {
    const { userId } = req.params;

    // if (userId != req.userId) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "شما اجازه دسترسی ندارید",
    //   });
    // }

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.flushHeaders(); 

    addClient(userId, res);

    
    res.write(`data: ${JSON.stringify({ connected: true })}\n\n`);

    try {
      const devices = await Device.findByUserId(userId);

      if (!devices || devices.length === 0) {
        return res.write(
          `data: ${JSON.stringify({ message: "دستگاهی یافت نشد" })}\n\n`
        );
      }

      for (const device of devices) {
        const latestData = await DeviceData.findLatestByDeviceId(device.id);
        if (latestData ) {
          res.write(`data: ${JSON.stringify(latestData)}\n\n`);
        }
      }
    } catch (error) {
      console.error("Error sending initial data:", error);
      if (!res.writableEnded) {
        res.write(
          `data: ${JSON.stringify({ error: "خطا در دریافت اطلاعات اولیه" })}\n\n`
        );
      }
    }
  }
}

export default SSEController;

