/*Architecture Overview

BuildTrack uses a relational database design optimized for construction management with the following key architectural decisions:

Design Principles:

    Normalization: 3NF (Third Normal Form) with strategic denormalization for reporting

    Soft Delete: All tables include deleted_at for data recovery

    Audit Trail: Comprehensive logging with audit_logs table

    RBAC: Role-based access control with flexible permissions

    Scalability: Strategic indexing for read-heavy operations

    Data Integrity: Foreign key constraints with cascading rules

Key Relationships:

    Projects owned by Contractors (one-to-many)

    Workers assigned to Projects (many-to-many via assignments)

    Materials linked to Projects through transactions

    Expenses approved by Contractors

    Documents linked to multiple entities (Projects, Workers, Suppliers)

Technology Stack Compatibility

    MySQL 8.0+ with InnoDB storage engine

    Node.js + Sequelize ORM for database operations

    JWT for authentication

    Redis for caching (optional)*/



    /*// ============================================================
// API ROUTES STRUCTURE
// ============================================================

// 1. Authentication Routes
// /api/v1/auth
POST   /register          - Register new user
POST   /login             - Login user
POST   /refresh-token     - Refresh JWT token
POST   /logout            - Logout user
GET    /profile           - Get user profile
PUT    /profile           - Update user profile
POST   /change-password   - Change password
POST   /forgot-password   - Request password reset
POST   /reset-password    - Reset password

// 2. User Management Routes
// /api/v1/users
GET    /                  - List all users (admin only)
GET    /:id               - Get user by ID
POST   /                  - Create user (admin/contractor)
PUT    /:id               - Update user (admin/contractor)
DELETE /:id               - Delete user (admin/contractor)
POST   /:id/verify        - Verify user (admin/contractor)
POST   /:id/deactivate    - Deactivate user (admin/contractor)

// 3. Project Routes
// /api/v1/projects
GET    /                  - List projects
GET    /:id               - Get project by ID
POST   /                  - Create project
PUT    /:id               - Update project
DELETE /:id               - Delete project
GET    /:id/members       - Get project members
POST   /:id/members       - Add member to project
DELETE /:id/members/:userId - Remove member from project
GET    /:id/expenses      - Get project expenses
GET    /:id/workers       - Get project workers
GET    /:id/materials     - Get project materials
GET    /:id/reports       - Get project reports
POST   /:id/status        - Update project status

// 4. Worker Routes
// /api/v1/workers
GET    /                  - List workers
GET    /:id               - Get worker by ID
POST   /                  - Create worker
PUT    /:id               - Update worker
DELETE /:id               - Delete worker
GET    /:id/attendance    - Get worker attendance
GET    /:id/projects      - Get worker projects
POST   /:id/assign        - Assign worker to project
POST   /:id/attendance    - Record worker attendance

// 5. Attendance Routes
// /api/v1/attendance
GET    /                  - List attendance records
GET    /:id               - Get attendance by ID
POST   /                  - Create attendance record
PUT    /:id               - Update attendance record
DELETE /:id               - Delete attendance record
GET    /project/:projectId - Get attendance by project
GET    /worker/:workerId  - Get attendance by worker
GET    /date-range        - Get attendance by date range
POST   /:id/approve       - Approve attendance

// 6. Material Routes
// /api/v1/materials
GET    /                  - List materials
GET    /:id               - Get material by ID
POST   /                  - Create material
PUT    /:id               - Update material
DELETE /:id               - Delete material
GET    /categories        - List material categories
POST   /categories        - Create material category
GET    /inventory         - Get inventory summary
POST   /transactions      - Record material transaction
GET    /:id/transactions  - Get material transactions

// 7. Supplier Routes
// /api/v1/suppliers
GET    /                  - List suppliers
GET    /:id               - Get supplier by ID
POST   /                  - Create supplier
PUT    /:id               - Update supplier
DELETE /:id               - Delete supplier
POST   /:id/contacts      - Add supplier contact
PUT    /:id/contacts/:contactId - Update supplier contact
DELETE /:id/contacts/:contactId - Delete supplier contact
GET    /:id/purchase-orders - Get supplier purchase orders

// 8. Purchase Order Routes
// /api/v1/purchase-orders
GET    /                  - List purchase orders
GET    /:id               - Get purchase order by ID
POST   /                  - Create purchase order
PUT    /:id               - Update purchase order
DELETE /:id               - Delete purchase order
POST   /:id/approve       - Approve purchase order
POST   /:id/receive       - Receive purchase order
POST   /:id/cancel        - Cancel purchase order

// 9. Expense Routes
// /api/v1/expenses
GET    /                  - List expenses
GET    /:id               - Get expense by ID
POST   /                  - Create expense
PUT    /:id               - Update expense
DELETE /:id               - Delete expense
GET    /categories        - List expense categories
POST   /categories        - Create expense category
POST   /:id/approve       - Approve expense
POST   /:id/reject        - Reject expense
GET    /project/:projectId - Get project expenses
GET    /summary           - Get expense summary

// 10. Payment Routes
// /api/v1/payments
GET    /                  - List payments
GET    /:id               - Get payment by ID
POST   /                  - Create payment
PUT    /:id               - Update payment
DELETE /:id               - Delete payment
POST   /:id/process       - Process payment
POST   /:id/fail          - Fail payment
GET    /project/:projectId - Get project payments
GET    /worker/:workerId  - Get worker payments
GET    /summary           - Get payment summary

// 11. Budget Routes
// /api/v1/budgets
GET    /                  - List budgets
GET    /:id               - Get budget by ID
POST   /                  - Create budget
PUT    /:id               - Update budget
DELETE /:id               - Delete budget
GET    /project/:projectId - Get project budgets
GET    /vs-actual         - Get budget vs actual

// 12. Report Routes
// /api/v1/reports
POST   /generate          - Generate report
GET    /:id               - Get report by ID
GET    /list              - List reports
DELETE /:id               - Delete report
GET    /export/:id        - Export report (PDF/Excel/CSV)
GET    /project/:projectId - Get project reports
GET    /financial         - Get financial reports
GET    /attendance        - Get attendance reports
GET    /material          - Get material reports

// 13. Document Routes
// /api/v1/documents
GET    /                  - List documents
GET    /:id               - Get document by ID
POST   /                  - Upload document
PUT    /:id               - Update document
DELETE /:id               - Delete document
GET    /download/:id      - Download document
GET    /entity/:type/:id  - Get documents by entity
POST   /:id/version       - Create new version

// 14. Dashboard Routes
// /api/v1/dashboard
GET    /                  - Get dashboard summary
GET    /overview          - Get overview stats
GET    /projects          - Get project stats
GET    /financial         - Get financial stats
GET    /workers           - Get worker stats
GET    /materials         - Get material stats

// 15. Analytics Routes
// /api/v1/analytics
GET    /revenue           - Get revenue analytics
GET    /expenses          - Get expense analytics
GET    /projects          - Get project analytics
GET    /workers           - Get worker analytics
GET    /materials         - Get material analytics
GET    /productivity      - Get productivity analytics
*/