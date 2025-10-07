import { createAPIInstance } from "../config/api";

const api = createAPIInstance();

// Types สำหรับ Status Service
export interface Status {
  _id: string;
  content: string;
  createdBy: {
    _id: string;
    email: string;
    image?: string;
  };
  like: any[];
  comment: any[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface CreateStatusRequest {
  content: string;
}

export interface CommentRequest {
  statusId: string;
  content: string;
}

export interface LikeRequest {
  statusId: string;
}

export interface StatusAPIResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
}

class StatusService {
  /**
   * สร้างโพสใหม่
   */
  async createStatus(request: CreateStatusRequest): Promise<StatusAPIResponse> {
    try {
      console.log("📝 Creating status...");

      const response = await api.post("/status", request);

      return {
        success: true,
        message: "สร้างโพสสำเร็จ",
      };
    } catch (error: any) {
      console.error("📝 Create status error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "ไม่สามารถสร้างโพสได้",
      };
    }
  }

  /**
   * ดึงโพสทั้งหมด
   */
  async getAllStatuses(): Promise<StatusAPIResponse<Status[]>> {
    try {
      const response = await api.get("/status");

      let statuses: Status[] = [];

      if (response.data) {
        // กรณีที่ข้อมูลอยู่ใน response.data.data (nested structure)
        if (response.data.data && Array.isArray(response.data.data)) {
          statuses = response.data.data;
        }
        // กรณีที่ข้อมูลอยู่ใน response.data โดยตรง
        else if (Array.isArray(response.data)) {
          statuses = response.data;
        }
      }

      console.log("📚 Found", statuses.length, "statuses");

      return {
        success: true,
        data: statuses,
        message: "ดึงโพสสำเร็จ",
      };
    } catch (error: any) {
      console.error("📚 Get statuses error:", error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || "ไม่สามารถดึงโพสได้",
      };
    }
  }

  /**
   * ดึงโพสตาม ID
   */
  async getStatusById(id: string): Promise<StatusAPIResponse<Status>> {
    try {
      console.log("📄 Getting status:", id);

      const response = await api.get(`/status/${id}`);

      let statusData: Status | null = null;

      if (response.data) {
        if (response.data.data) {
          statusData = response.data.data;
        } else if (response.data._id) {
          statusData = response.data;
        }
      }

      if (statusData) {
        return {
          success: true,
          data: statusData,
          message: "ดึงโพสสำเร็จ",
        };
      }

      return {
        success: false,
        message: "ไม่พบโพสที่ระบุ",
      };
    } catch (error: any) {
      console.error("📄 Get status error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "ไม่สามารถดึงโพสได้",
      };
    }
  }

  /**
   * เพิ่มคอมเมนท์
   */
  async addComment(request: CommentRequest): Promise<StatusAPIResponse> {
    try {
      console.log("💬 Adding comment...");

      const response = await api.post("/comment", request);

      return {
        success: true,
        message: "เพิ่มคอมเมนท์สำเร็จ",
      };
    } catch (error: any) {
      console.error("💬 Add comment error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "ไม่สามารถเพิ่มคอมเมนท์ได้",
      };
    }
  }

  /**
   * ลบคอมเมนท์
   */
  async deleteComment(
    statusId: string,
    commentId: string
  ): Promise<StatusAPIResponse> {
    try {
      console.log("🗑️ Deleting comment:", { statusId, commentId });

      // ใช้ endpoint ที่ถูกต้อง: /comment/{commentId} กับ statusId ใน body
      const response = await api.delete(`/comment/${commentId}`, {
        data: {
          statusId: statusId,
        },
      });

      return {
        success: true,
        message: "ลบคอมเมนท์สำเร็จ",
      };
    } catch (error: any) {
      console.error("🗑️ Delete comment error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "ไม่สามารถลบคอมเมนท์ได้",
      };
    }
  }

  /**
   * ไลค์โพส
   */
  async likeStatus(request: LikeRequest): Promise<StatusAPIResponse> {
    try {
      console.log("👍 Liking status...");

      const response = await api.post("/like", request);

      return {
        success: true,
        message: "ไลค์สำเร็จ",
      };
    } catch (error: any) {
      console.error("👍 Like status error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "ไม่สามารถไลค์ได้",
      };
    }
  }

  /**
   * อันไลค์โพส (ใช้ DELETE /like)
   */
  async unlikeStatus(request: LikeRequest): Promise<StatusAPIResponse> {
    try {
      console.log("👎 Unliking status...");

      const response = await api.delete("/like", { data: request });

      return {
        success: true,
        message: "เลิกไลค์แล้ว",
      };
    } catch (error: any) {
      console.error("👎 Unlike status error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "ไม่สามารถเลิกไลค์ได้",
      };
    }
  }

  /**
   * ลบโพส
   */
  async deleteStatus(id: string): Promise<StatusAPIResponse> {
    try {
      console.log("🗑️ Deleting status:", id);

      const response = await api.delete(`/status/${id}`);

      return {
        success: true,
        message: "ลบโพสสำเร็จ",
      };
    } catch (error: any) {
      console.error("🗑️ Delete status error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "ไม่สามารถลบโพสได้",
      };
    }
  }
}

export default new StatusService();
