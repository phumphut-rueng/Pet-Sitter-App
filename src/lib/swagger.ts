// src/lib/swagger.ts
import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "🐶 Pet Sitter API Docs",
      version: "1.0.0",
      description: "API documentation (Next.js + Prisma + NextAuth)",
    },
    servers: [
      { url: "http://localhost:3000/api", description: "Local" },
      // { url: "https://your-prod-domain/api", description: "Production" },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "next-auth.session-token", // prod มักเป็น __Secure-next-auth.session-token
          description: "NextAuth session cookie",
        },
        AdminApiKey: {
          type: "apiKey",
          in: "header",
          name: "x-user-id",
          description: "Internal admin user id (fallback)",
        },
      },
      schemas: {
        AdminBanRequest: {
          type: "object",
          required: ["action"],
          properties: {
            action: { type: "string", enum: ["ban", "unban"] },
            reason: { type: "string", nullable: true },
            cascadePets: { type: "boolean", default: true },
          },
        },
        AdminBanResponse: {
          type: "object",
          properties: {
            ok: { type: "boolean", example: true },
            user: {
              type: "object",
              properties: {
                status: { type: "string", example: "ban" },
                banned_at: { type: "string", nullable: true },
                ban_reason: { type: "string", nullable: true },
              },
            },
          },
        },
        AdminOwnerPet: {
          type: "object",
          properties: {
            id: { type: "integer", example: 501 },
            name: { type: "string", nullable: true, example: "Milo" },
            breed: { type: "string", nullable: true, example: "Shiba" },
            sex: { type: "string", nullable: true, example: "male" },
            age_month: { type: "integer", nullable: true, example: 18 },
            color: { type: "string", nullable: true, example: "brown" },
            image_url: { type: "string", nullable: true },
            created_at: { type: "string", example: "2025-10-20T10:00:00.000Z" },
            is_banned: { type: "boolean", example: false },
            pet_type_name: { type: "string", nullable: true, example: "Dog" },
          },
        },
        Notification: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            type: { type: "string", enum: ["message", "booking", "payment", "system", "admin"], example: "booking" },
            title: { type: "string", example: "Booking Confirmed! 🎉" },
            message: { type: "string", example: "Your booking with John Doe has been confirmed" },
            isRead: { type: "boolean", example: false },
            time: { type: "string", example: "Just now" },
            createdAt: { type: "string", example: "2025-10-25T10:00:00.000Z" },
          },
        },
        NotificationResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            notifications: {
              type: "array",
              items: { $ref: "#/components/schemas/Notification" },
            },
            unreadCount: { type: "integer", example: 3 },
          },
        },
        CreateNotificationRequest: {
          type: "object",
          required: ["userId", "type", "title", "message"],
          properties: {
            userId: { type: "integer", example: 123 },
            type: { type: "string", enum: ["message", "booking", "payment", "system", "admin"], example: "booking" },
            title: { type: "string", example: "Booking Confirmed! 🎉" },
            message: { type: "string", example: "Your booking has been confirmed" },
          },
        },
        AdminOwnerDetail: {
          type: "object",
          properties: {
            id: { type: "integer", example: 101 },
            name: { type: "string", nullable: true, example: "John Doe" },
            email: { type: "string", nullable: true, example: "john@example.com" },
            phone: { type: "string", nullable: true, example: "0812345678" },
            profile_image: { type: "string", nullable: true },
            profile_image_public_id: { type: "string", nullable: true },
            created_at: { type: "string", example: "2025-10-21T12:00:00.000Z" },
            status: { type: "string", example: "normal" },
            banned_at: { type: "string", nullable: true },
            ban_reason: { type: "string", nullable: true },
            pets: { type: "array", items: { $ref: "#/components/schemas/AdminOwnerPet" } },
          },
        },
        AdminOwnerPetItem: {
          type: "object",
          properties: {
            id: { type: "integer", example: 501 },
            name: { type: "string", nullable: true, example: "Milo" },
            breed: { type: "string", nullable: true, example: "Shiba" },
            sex: { type: "string", nullable: true, example: "male" },
            age_month: { type: "integer", nullable: true, example: 18 },
            color: { type: "string", nullable: true, example: "brown" },
            weight_kg: { type: "number", nullable: true, example: 8.2 },
            about: { type: "string", nullable: true, example: "Friendly and energetic" },
            image_url: { type: "string", nullable: true, example: null },
            is_banned: { type: "boolean", example: false },
            created_at: { type: "string", example: "2025-10-20T10:00:00.000Z" },
            pet_type_id: { type: "integer", nullable: true, example: 1 },
            pet_type_name: { type: "string", nullable: true, example: "Dog" },
          },
        },
        AdminOwnerPetList: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/AdminOwnerPetItem" },
            },
            page: { type: "integer", example: 1 },
            limit: { type: "integer", example: 12 },
            total: { type: "integer", example: 34 },
          },
        },
        AdminOwnerReviewSitter: {
          type: "object",
          properties: {
            id: { type: "integer", nullable: true, example: 21 },
            name: { type: "string", example: "Pet Sitter" },
            avatarUrl: { type: "string", example: "https://cdn.example.com/avatar.png" },
            userId: { type: "integer", nullable: true, example: 305 },
          },
        },
        
        AdminOwnerReviewItem: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1001 },
            rating: { type: "number", example: 4.5 },
            comment: { type: "string", example: "Great service!" },
            createdAt: { type: "string", example: "2025-10-21T12:00:00.000Z" },
            sitter: { $ref: "#/components/schemas/AdminOwnerReviewSitter" },
          },
        },
        
        AdminOwnerReviewsResponse: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/AdminOwnerReviewItem" },
            },
            meta: {
              type: "object",
              properties: {
                page: { type: "integer", example: 1 },
                pageSize: { type: "integer", example: 10 },
                total: { type: "integer", example: 57 },
                averageRating: { type: "number", example: 4.23 },
              },
            },
          },
        },
        AdminOwnerDetailPet: {
          type: "object",
          properties: {
            id: { type: "integer", example: 701 },
            name: { type: "string", nullable: true, example: "Milo" },
            pet_type_name: { type: "string", nullable: true, example: "Dog" },
            breed: { type: "string", nullable: true, example: "Shiba" },
            sex: { type: "string", nullable: true, example: "male" },
            age_month: { type: "integer", nullable: true, example: 20 },
            color: { type: "string", nullable: true, example: "brown" },
            weight_kg: { type: "string", example: "8.2" }, // ตามโค้ดเป็น string
            about: { type: "string", nullable: true, example: "Gentle and playful" },
            image_url: { type: "string", nullable: true, example: null },
            is_banned: { type: "boolean", example: false },
            banned_at: { type: "string", nullable: true, example: null },
            ban_reason: { type: "string", nullable: true, example: null },
          },
        },
        
        AdminOwnerDetailById: {
          type: "object",
          properties: {
            id: { type: "integer", example: 123 },
            name: { type: "string", nullable: true, example: "John Doe" },
            email: { type: "string", example: "john@example.com" },
            phone: { type: "string", nullable: true, example: "0812345678" },
            profile_image: { type: "string", nullable: true, example: null },
            profile_image_public_id: { type: "string", nullable: true, example: null },
            id_number: { type: "string", nullable: true, example: "1103700XXXXXXX" },
            dob: { type: "string", nullable: true, example: "1995-05-01T00:00:00.000Z" },
            status: { type: "string", example: "normal", enum: ["normal", "ban"] },
            created_at: { type: "string", example: "2025-10-21T12:00:00.000Z" },
            suspended_at: { type: "string", nullable: true, example: null },
            banned_at: { type: "string", nullable: true, example: null },
            suspend_reason: { type: "string", nullable: true, example: null },
            admin_note: { type: "string", nullable: true, example: "KYC verified" },
            pets: {
              type: "array",
              items: { $ref: "#/components/schemas/AdminOwnerDetailPet" },
            },
          },
        },
        AdminOwnersListItem: {
          type: "object",
          properties: {
            id: { type: "integer", example: 123 },
            name: { type: "string", nullable: true, example: "John Doe" },
            email: { type: "string", example: "john@example.com" },
            phone: { type: "string", nullable: true, example: "0812345678" },
            created_at: { type: "string", example: "2025-10-21T12:00:00.000Z" },
            pet_count: { type: "integer", example: 3 },
            profile_image: { type: "string", nullable: true, example: null },
            profile_image_public_id: { type: "string", nullable: true, example: null },
            status: { type: "string", enum: ["normal", "ban"], example: "normal" },
          },
        },
        
        AdminOwnersListResponse: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/AdminOwnersListItem" },
            },
            total: { type: "integer", example: 128 },
            page: { type: "integer", example: 1 },
            limit: { type: "integer", example: 10 },
          },
        },
        AdminPetBanRequest: {
          type: "object",
          required: ["action"],
          properties: {
            action: { type: "string", enum: ["ban", "unban"] },
            reason: { type: "string", nullable: true, description: "Reason for banning (optional)" },
          },
        },
        AdminPetBanResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "Pet status updated successfully" },
            petId: { type: "integer", example: 987 },
            action: { type: "string", enum: ["ban", "unban"], example: "ban" },
            is_banned: { type: "boolean", example: true },
            banned_at: { type: "string", nullable: true, example: "2025-10-21T12:34:56.000Z" },
            ban_reason: { type: "string", nullable: true, example: "Aggressive behavior" },
            banned_by_admin_id: { type: "integer", nullable: true, example: 12 },
          },
        },
        AdminApproveSitterRequest: {
          type: "object",
          required: ["sitterId"],
          properties: {
            sitterId: { type: "integer", example: 123 },
          },
        },
        
        AdminApproveSitterResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "Pet Sitter approved successfully" },
            data: {
              type: "object",
              properties: {
                sitterId: { type: "integer", example: 123 },
                status: { type: "string", example: "Approved" },
                approvedBy: { type: "string", example: "Alice Admin" },
                updatedAt: { type: "string", example: "2025-10-21T12:34:56.000Z" }
              }
            }
          }
        },
        // ใช้ซ้ำกับ /get-sitter-by-id (มีเพิ่มฟิลด์อื่นจาก sitter.* ด้วย)
AdminSitterImageItem: {
  type: "object",
  properties: {
    id: { type: "integer", example: 11 },
    image_url: { type: "string", example: "https://cdn.example.com/sitter/11.jpg" },
  },
},

AdminSitterPetTypeItem: {
  type: "object",
  properties: {
    pet_type: {
      type: "object",
      properties: {
        pet_type_name: { type: "string", example: "Dog" },
      },
    },
  },
},

AdminSitterDetailResponse: {
  type: "object",
  additionalProperties: true,
  properties: {
    id: { type: "integer", example: 321 },
    user_sitter_id: { type: "integer", example: 123 },
    service_description: { type: "string", nullable: true, example: "I love dogs and cats." },
    approval_status_id: { type: "integer", example: 4 },
    approval_status: { type: "string", example: "Approved" },
    status_description: { type: "string", nullable: true, example: "Approved by admin" },
    user_name: { type: "string", nullable: true, example: "Jane Sitter" },
    user_email: { type: "string", nullable: true, example: "jane@example.com" },
    user_dob: { type: "string", nullable: true, example: "1996-02-10T00:00:00.000Z" },
    user_profile_image: { type: "string", nullable: true, example: "https://cdn.example.com/u/123.png" },
    averageRating: { type: "number", example: 4.35 },
    sitter_image: { type: "array", items: { $ref: "#/components/schemas/AdminSitterImageItem" } },
    sitter_pet_type: { type: "array", items: { $ref: "#/components/schemas/AdminSitterPetTypeItem" } },
  },
  example: {
    id: 321,
    user_sitter_id: 123,
    service_description: "I love dogs and cats.",
    approval_status_id: 4,
    approval_status: "Approved",
    status_description: "Approved by admin",
    user_name: "Jane Sitter",
    user_email: "jane@example.com",
    user_dob: "1996-02-10T00:00:00.000Z",
    user_profile_image: "https://cdn.example.com/u/123.png",
    averageRating: 4.35,
    sitter_image: [{ id: 11, image_url: "https://cdn.example.com/sitter/11.jpg" }],
    sitter_pet_type: [{ pet_type: { pet_type_name: "Dog" } }],
  },
},

AdminSitterListPagination: {
  type: "object",
  properties: {
    page: { type: "integer", example: 1 },
    limit: { type: "integer", example: 10 },
    totalCount: { type: "integer", example: 128 },
    totalPages: { type: "integer", example: 13 },
  },
},

AdminSitterListResponse: {
  type: "object",
  properties: {
    // กรณีพบข้อมูล
    data: {
      type: "array",
      items: { $ref: "#/components/schemas/AdminSitterDetailResponse" },
    },
    pagination: { $ref: "#/components/schemas/AdminSitterListPagination" },

    // กรณีไม่พบข้อมูล (โค้ดคุณส่ง message + data=[] + pagination 0)
    message: { type: "string", nullable: true, example: "ไม่พบข้อมูล" },
  },
},
AdminSitterUserProfileItem: {
  // มาจาก subquery sitter_profiles ของแต่ละ user
  type: "object",
  properties: {
    id: { type: "integer", example: 77 },
    name: { type: "string", nullable: true, example: "Happy Paws" },
    address_province: { type: "string", nullable: true, example: "Bangkok" },
    address_district: { type: "string", nullable: true, example: "Bang Kapi" },
  },
},

AdminSitterUserPetTypeItem: {
  // หลัง format: { pet_type: { pet_type_name: "Dog" } }
  type: "object",
  properties: {
    pet_type: {
      type: "object",
      properties: {
        pet_type_name: { type: "string", example: "Dog" },
      },
    },
  },
},

AdminSitterUserItem: {
  // โครงจาก u.* + enrich fields (approval_status, status_description, averageRating, sitter_profiles, pet_types)
  type: "object",
  additionalProperties: true, // อนุญาตฟิลด์อื่นจาก u.*
  properties: {
    id: { type: "integer", example: 123 },
    name: { type: "string", nullable: true, example: "Jane Sitter" },
    email: { type: "string", nullable: true, example: "jane@example.com" },
    dob: { type: "string", nullable: true, example: "1996-02-10T00:00:00.000Z" },
    profile_image: { type: "string", nullable: true, example: "https://cdn.example.com/u/123.png" },

    approval_status: { type: "string", nullable: true, example: "Waiting for approve" },
    status_description: { type: "string", nullable: true, example: "Awaiting admin review" },

    averageRating: { type: "number", example: 4.12 },

    sitter_profiles: {
      type: "array",
      items: { $ref: "#/components/schemas/AdminSitterUserProfileItem" },
    },
    pet_types: {
      type: "array",
      items: { $ref: "#/components/schemas/AdminSitterUserPetTypeItem" },
    },
  },
  example: {
    id: 123,
    name: "Jane Sitter",
    email: "jane@example.com",
    approval_status: "Approved",
    status_description: "Approved by admin",
    averageRating: 4.3,
    sitter_profiles: [
      { id: 77, name: "Happy Paws", address_province: "Bangkok", address_district: "Bang Kapi" }
    ],
    pet_types: [{ pet_type: { pet_type_name: "Dog" } }],
  },
},

AdminSitterUsersPagination: {
  type: "object",
  properties: {
    page: { type: "integer", example: 1 },
    limit: { type: "integer", example: 8 },
    totalCount: { type: "integer", example: 42 },
    totalPages: { type: "integer", example: 6 },
  },
},

AdminSitterUsersListResponse: {
  type: "object",
  properties: {
    // กรณีพบข้อมูล
    data: {
      type: "array",
      items: { $ref: "#/components/schemas/AdminSitterUserItem" },
    },
    pagination: { $ref: "#/components/schemas/AdminSitterUsersPagination" },

    // กรณีไม่พบข้อมูล (โค้ดคุณส่ง message + data=[] + pagination 0)
    message: { type: "string", nullable: true, example: "ไม่พบข้อมูล" },
  },
},
AdminSitterApprovalHistoryItem: {
  type: "object",
  properties: {
    id: { type: "integer", example: 101 },
    sitterId: { type: "integer", example: 321 },
    sitterName: { type: "string", example: "Happy Paws" },
    statusId: { type: "integer", example: 4 },
    statusName: { type: "string", example: "Approved" },
    adminId: { type: "integer", nullable: true, example: 12 },
    adminName: { type: "string", example: "Alice Admin" },
    adminEmail: { type: "string", nullable: true, example: "alice@example.com" },
    adminNote: { type: "string", nullable: true, example: "Re-reviewed documents" },
    changedAt: { type: "string", example: "2025-10-21T12:34:56.000Z" }
  },
},

AdminSitterApprovalHistoryPagination: {
  type: "object",
  properties: {
    currentPage: { type: "integer", example: 1 },
    totalPages: { type: "integer", example: 5 },
    totalRecords: { type: "integer", example: 42 },
    recordsPerPage: { type: "integer", example: 8 },
    hasNextPage: { type: "boolean", example: true },
    hasPrevPage: { type: "boolean", example: false },
  },
},

AdminSitterApprovalHistoryListResponse: {
  type: "object",
  properties: {
    message: { type: "string", example: "Approval history retrieved successfully" },
    data: {
      type: "array",
      items: { $ref: "#/components/schemas/AdminSitterApprovalHistoryItem" },
    },
    pagination: { $ref: "#/components/schemas/AdminSitterApprovalHistoryPagination" },
  },
},
AdminRejectSitterRequest: {
  type: "object",
  required: ["sitterId", "adminNote"],
  properties: {
    sitterId: { type: "integer", example: 123 },
    adminNote: { type: "string", example: "Incomplete documents" },
  },
},

AdminRejectSitterResponse: {
  type: "object",
  properties: {
    message: { type: "string", example: "Pet Sitter rejected successfully" },
    data: {
      type: "object",
      properties: {
        sitterId: { type: "integer", example: 123 },
        status: { type: "string", example: "Rejected" },
        adminNote: { type: "string", example: "Incomplete documents" },
        rejectedBy: { type: "string", example: "Alice Admin" },
        updatedAt: { type: "string", example: "2025-10-21T12:34:56.000Z" },
      },
    },
  },
},
AdminSitterSearchSuggestionItem: {
  type: "object",
  properties: {
    sitterName: { type: "string", example: "Happy Paws" },
    userName: { type: "string", example: "Jane Sitter" },
    type: { type: "string", enum: ["sitter", "user"], example: "sitter" },
  },
},

AdminSitterSearchSuggestionsResponse: {
  type: "object",
  properties: {
    suggestions: {
      type: "array",
      items: { $ref: "#/components/schemas/AdminSitterSearchSuggestionItem" },
    },
  },
  example: {
    suggestions: [
      { sitterName: "Happy Paws", userName: "Jane Sitter", type: "sitter" },
      { sitterName: "Cozy Pets", userName: "Jane Sitter", type: "user" }
    ]
  }
},
AdminReportUserRef: {
  type: "object",
  properties: {
    id: { type: "integer", example: 501 },
    name: { type: "string", nullable: true, example: "John Doe" },
    email: { type: "string", example: "john@example.com" },
    profileImage: { type: "string", nullable: true, example: "https://cdn.example.com/u/501.png" },
  },
},

AdminReportHandledBy: {
  type: "object",
  properties: {
    id: { type: "integer", example: 12 },
    userId: { type: "integer", example: 3001 },
    name: { type: "string", nullable: true, example: "Alice Admin" },
    email: { type: "string", nullable: true, example: "alice@example.com" },
    profileImage: { type: "string", nullable: true, example: null },
  },
},

AdminReportDetailPayload: {
  type: "object",
  properties: {
    id: { type: "integer", example: 101 },
    title: { type: "string", example: "Fraudulent listing" },
    description: { type: "string", example: "Suspicious activity was observed..." },
    status: {
      type: "string",
      enum: ["new", "pending", "resolved", "canceled"],
      example: "pending"
    },
    reporter: { $ref: "#/components/schemas/AdminReportUserRef" },
    reportedUser: {
      oneOf: [
        { $ref: "#/components/schemas/AdminReportUserRef" },
        { type: "null" }
      ]
    },
    handledBy: {
      oneOf: [
        { $ref: "#/components/schemas/AdminReportHandledBy" },
        { type: "null" }
      ]
    },
    createdAt: { type: "string", example: "2025-10-21T08:12:33.000Z" },
    updatedAt: { type: "string", example: "2025-10-21T09:00:00.000Z" },
  },
},

AdminReportDetailResponse: {
  type: "object",
  properties: {
    report: { $ref: "#/components/schemas/AdminReportDetailPayload" },
  },
  example: {
    report: {
      id: 101,
      title: "Fraudulent listing",
      description: "Suspicious activity was observed...",
      status: "pending",
      reporter: {
        id: 10,
        name: "Bob",
        email: "bob@example.com",
        profileImage: null
      },
      reportedUser: {
        id: 20,
        name: "Eve",
        email: "eve@example.com",
        profileImage: "https://cdn.example.com/u/20.png"
      },
      handledBy: {
        id: 3,
        userId: 999,
        name: "Alice Admin",
        email: "alice@example.com",
        profileImage: null
      },
      createdAt: "2025-10-21T08:12:33.000Z",
      updatedAt: "2025-10-21T09:00:00.000Z"
    }
  }
},

AdminReportUpdateRequest: {
  type: "object",
  required: ["status"],
  properties: {
    status: {
      type: "string",
      enum: ["pending", "resolved", "canceled"],
      example: "resolved"
    }
  }
},

AdminReportUpdateResponse: {
  type: "object",
  properties: {
    message: { type: "string", example: "Report updated successfully" }
  }
},
AdminReportListItem: {
  type: "object",
  properties: {
    id: { type: "integer", example: 101 },
    title: { type: "string", example: "Fraudulent listing" },
    description: { type: "string", nullable: true, example: "Suspicious activity was observed..." },
    status: {
      type: "string",
      enum: ["new", "pending", "resolved", "canceled"],
      example: "pending"
    },
    reporter: { $ref: "#/components/schemas/AdminReportUserRef" },
    reportedUser: {
      oneOf: [
        { $ref: "#/components/schemas/AdminReportUserRef" },
        { type: "null" }
      ]
    },
    createdAt: { type: "string", example: "2025-10-21T08:12:33.000Z" },
    updatedAt: { type: "string", example: "2025-10-21T09:00:00.000Z" },
  },
},

AdminReportsPagination: {
  type: "object",
  properties: {
    page: { type: "integer", example: 1 },
    limit: { type: "integer", example: 10 },
    total: { type: "integer", example: 128 },
    totalPages: { type: "integer", example: 13 },
  },
},

AdminReportsListResponse: {
  type: "object",
  properties: {
    reports: {
      type: "array",
      items: { $ref: "#/components/schemas/AdminReportListItem" },
    },
    pagination: { $ref: "#/components/schemas/AdminReportsPagination" },
  },
  example: {
    reports: [
      {
        id: 101,
        title: "Fraudulent listing",
        description: "Suspicious activity was observed...",
        status: "pending",
        reporter: {
          id: 10, name: "Bob", email: "bob@example.com", profileImage: null
        },
        reportedUser: {
          id: 20, name: "Eve", email: "eve@example.com", profileImage: "https://cdn.example.com/u/20.png"
        },
        createdAt: "2025-10-21T08:12:33.000Z",
        updatedAt: "2025-10-21T09:00:00.000Z"
      }
    ],
    pagination: { page: 1, limit: 10, total: 128, totalPages: 13 }
  }
},
      },
    },
    security: [{ cookieAuth: [] }, { AdminApiKey: [] }],
  },
  // ให้สแกนทุกไฟล์ API ของ Next.js
  apis: ["./src/pages/api/**/*.ts"],
});
