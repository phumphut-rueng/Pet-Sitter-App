import axios from "axios";
import type { SitterDetail } from "@/types/admin";

export class AdminSitterService {
  private static readonly BASE_URL = "/api/admin/petsitter";

  static async getSitterById(id: string | string[] | undefined): Promise<SitterDetail | null> {
    if (!id) return null;
    
    try {
      const response = await axios.get(`${this.BASE_URL}/get-sitter-by-id?id=${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching sitter detail:", error);
      return null;
    }
  }

  static async getBookings(params: {
    sitterId: string;
    page?: number;
    limit?: number;
    id?: number;
  }) {
    try {
      const response = await axios.get(`${this.BASE_URL}/bookings`, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching bookings:", error);
      throw error;
    }
  }

  static async getReviews(params: {
    sitterId: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const response = await axios.get(`${this.BASE_URL}/reviews`, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching reviews:", error);
      throw error;
    }
  }

  static async deleteReview(reviewId: number) {
    try {
      const response = await axios.delete(`${this.BASE_URL}/reviews?reviewId=${reviewId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting review:", error);
      throw error;
    }
  }

  static async getHistory(params: {
    sitterId: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const response = await axios.get(`${this.BASE_URL}/history`, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching history:", error);
      throw error;
    }
  }

  static async approveSitter(sitterId: number) {
    try {
      const response = await axios.put(`${this.BASE_URL}/approve`, { sitterId });
      return response.data;
    } catch (error) {
      console.error("Error approving sitter:", error);
      throw error;
    }
  }

  static async rejectSitter(sitterId: number, adminNote: string) {
    try {
      const response = await axios.put(`${this.BASE_URL}/reject`, { sitterId, adminNote });
      return response.data;
    } catch (error) {
      console.error("Error rejecting sitter:", error);
      throw error;
    }
  }
}
