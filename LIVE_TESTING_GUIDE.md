# 🌊 Blue Carbon Registry - Complete Live Testing Guide for All 4 Roles

## 🚀 **Getting Started**

**Prerequisites:** Both servers are now running:
- ✅ **Backend Server**: http://localhost:5000
- ✅ **Frontend Server**: http://localhost:5173

**Navigate to**: http://localhost:5173 in your browser

---

## 🎭 **Role-Based Testing Scenarios**

### **📋 Testing Overview**
You'll test **4 different user roles** with distinct dashboards and capabilities:

1. **🏘️ Community User** - Create and manage environmental projects
2. **🏭 Industry User** - Purchase carbon credits from marketplace
3. **🏛️ Government User** - Audit projects and manage policies
4. **👑 Admin User** - Approve projects and manage the entire system

---

## **🏘️ ROLE 1: COMMUNITY USER Testing**

### **Step 1: Create Community Account**
1. **Go to**: http://localhost:5173
2. **Click**: "Get Started" or "Sign Up" 
3. **Fill Registration Form**:
   ```
   First Name: John
   Last Name: Doe
   Email: community@test.com
   Password: password123
   Role: Community
   Organization: Local Environmental Group
   ```
4. **Click**: "Create Account"
5. **Expected Result**: Redirected to Community Dashboard

### **Step 2: Community Dashboard Exploration**
📍 **URL**: `/dashboard/community`

**Test These Features**:
- ✅ **Project Creation**: Click "Add New Project"
- ✅ **My Projects**: View existing projects
- ✅ **Profile Management**: Update community profile
- ✅ **Certificates**: View earned certificates
- ✅ **Leaderboard**: See community rankings

### **Step 3: Create a Blue Carbon Project**
1. **Click**: "Add Project" or "Create New Project"
2. **Fill Project Details**:
   ```
   Project Name: Mangrove Restoration Initiative
   Type: Mangroves
   Description: Restoring 50 hectares of mangrove forests
   Location: Coastal area, Kerala, India
   Target Area: 50 hectares
   Funding Goal: $25,000
   Duration: 24 months
   ```
3. **Upload**: Project documents and images
4. **Submit**: Project for approval
5. **Expected Result**: Project created with "Pending Approval" status

### **Step 4: Test Location Detection**
1. **In Project Creation**: Click "Detect My Location" 
2. **Allow GPS**: Browser should request location permission
3. **Verify**: Coordinates auto-populate
4. **Expected Result**: Accurate location coordinates filled

---

## **🏭 ROLE 2: INDUSTRY USER Testing**

### **Step 1: Create Industry Account**
1. **Logout** from community account (if logged in)
2. **Register New Account**:
   ```
   First Name: Sarah
   Last Name: Wilson
   Email: industry@test.com
   Password: password123
   Role: Industry
   Company: GreenTech Solutions
   Industry Type: Technology
   ```

### **Step 2: Industry Dashboard Features**
📍 **URL**: `/dashboard/industry`

**Test These Sections**:
- ✅ **Marketplace**: Browse available carbon credits
- ✅ **My Purchases**: View transaction history
- ✅ **Wallet**: Check credit balance
- ✅ **Reports**: Download compliance reports
- ✅ **Settings**: Update company profile

### **Step 3: Carbon Credit Marketplace Testing**
1. **Navigate**: Marketplace section
2. **Browse Projects**: See available carbon credit projects
3. **Filter Options**: Test project type, location, price filters
4. **Project Details**: Click on a project to view details
5. **Purchase Credits**: 
   ```
   Select Project: Choose an approved project
   Credit Amount: 100 tons CO2
   Payment Method: Credit Card (test mode)
   ```

### **Step 4: Compliance Reporting**
1. **Go to**: Reports section
2. **Generate Report**: Click "Create Compliance Report"
3. **Select Period**: Last 6 months
4. **Download**: PDF report with carbon offset data
5. **Expected Result**: Detailed compliance report generated

---

## **🏛️ ROLE 3: GOVERNMENT USER Testing**

### **Step 1: Create Government Account**
1. **Register Government User**:
   ```
   First Name: Dr. Priya
   Last Name: Sharma
   Email: government@test.com
   Password: password123
   Role: Government
   Department: Ministry of Environment
   Position: Environmental Officer
   ```

### **Step 2: Government Dashboard Functions**
📍 **URL**: `/dashboard/government`

**Key Features to Test**:
- ✅ **Project Auditing**: Review submitted projects
- ✅ **Policy Management**: Create environmental policies
- ✅ **Analytics**: View regional environmental data
- ✅ **Compliance Monitoring**: Track industry compliance
- ✅ **Reports**: Generate government reports

### **Step 3: Project Audit Workflow**
1. **Navigate**: "Audit Projects" section
2. **Review Projects**: See pending projects for review
3. **Select Project**: Choose the community mangrove project
4. **Audit Process**:
   - Review project documents
   - Check location coordinates
   - Verify funding requirements
   - Add audit comments
5. **Decision**: Approve or Request Changes
6. **Expected Result**: Project status updated

### **Step 4: Policy Management Testing**
1. **Go to**: Policies section
2. **Create New Policy**:
   ```
   Policy Title: Blue Carbon Project Standards
   Category: Environmental Protection
   Description: Standards for mangrove restoration projects
   Applicable Regions: All coastal states
   Effective Date: Current date
   ```
3. **Save Policy**: Submit for implementation

---

## **👑 ROLE 4: ADMIN USER Testing**

### **Step 1: Create Admin Account**
1. **Register Admin User**:
   ```
   First Name: Admin
   Last Name: User
   Email: admin@test.com
   Password: password123
   Role: Admin
   Department: System Administration
   ```

### **Step 2: Admin Dashboard Overview**
📍 **URL**: `/dashboard/admin`

**Admin Capabilities**:
- ✅ **User Management**: Manage all user accounts
- ✅ **Project Approval**: Approve/reject projects
- ✅ **Credit Issuance**: Issue carbon credits
- ✅ **System Analytics**: View platform statistics
- ✅ **Reports**: Generate system-wide reports
- ✅ **Settings**: Configure system parameters

### **Step 3: User Management Testing**
1. **Navigate**: User Management section
2. **View All Users**: See all registered users
3. **User Actions**:
   - Search users by role/email
   - View user profiles
   - Activate/deactivate accounts
   - Reset passwords
   - Assign roles

### **Step 4: Project Approval Workflow**
1. **Go to**: Project Approval section
2. **Review Projects**: See all pending projects
3. **Detailed Review**:
   - Open the mangrove project
   - Review all documentation
   - Check government audit results
   - Verify technical specifications
4. **Approval Process**:
   ```
   Status: Approve
   Carbon Credit Amount: 1,250 tons CO2
   Verification Period: 12 months
   Comments: Project meets all environmental standards
   ```

### **Step 5: Carbon Credit Issuance**
1. **Navigate**: Credit Issuance section
2. **Select Approved Project**: Choose the approved project
3. **Issue Credits**:
   ```
   Project: Mangrove Restoration Initiative
   Credit Amount: 1,250 tons CO2
   Certification: VCS Standard
   Validity Period: 10 years
   Blockchain Registration: Yes
   ```
4. **Generate Certificate**: Issue digital certificate
5. **Expected Result**: Credits available in marketplace

---

## **🔄 End-to-End Integration Testing**

### **Complete Workflow Test**
1. **Community**: Creates project → Submits for approval
2. **Government**: Audits project → Approves with conditions
3. **Admin**: Reviews audit → Approves and issues credits
4. **Industry**: Purchases credits → Receives certificates
5. **System**: Updates all dashboards and analytics

---

## **🎯 Key Features to Verify**

### **Authentication & Security**
- ✅ User registration and login
- ✅ Role-based access control
- ✅ Password security
- ✅ Session management
- ✅ Google OAuth integration

### **Project Management**
- ✅ Project creation and editing
- ✅ Document upload and management
- ✅ Location detection and mapping
- ✅ Progress tracking
- ✅ Status updates

### **Marketplace Functions**
- ✅ Credit listing and browsing
- ✅ Purchase transactions
- ✅ Payment processing (test mode)
- ✅ Certificate generation
- ✅ Transaction history

### **Analytics & Reporting**
- ✅ Dashboard statistics
- ✅ Environmental impact metrics
- ✅ User activity tracking
- ✅ Financial reporting
- ✅ Compliance documentation

### **Mobile Responsiveness**
- ✅ Test on mobile devices
- ✅ Touch interactions
- ✅ Responsive layouts
- ✅ Mobile navigation

---

## **🐛 Common Issues & Solutions**

### **If Login Fails**
```bash
# Check backend server is running
curl http://localhost:5000/api/health
```

### **If Database Connection Issues**
```bash
# Ensure MongoDB is running
mongosh --eval "db.adminCommand('ismaster')"
```

### **If Registration Fails**
- Check email format
- Ensure password meets requirements
- Try different email address

### **If Projects Don't Load**
- Check network tab in browser dev tools
- Verify API endpoints are responding
- Check console for JavaScript errors

---

## **📊 Success Criteria**

**✅ All tests pass if:**
- All 4 user roles can register and login
- Each role sees their specific dashboard
- Community users can create projects
- Government users can audit projects  
- Admin users can approve and issue credits
- Industry users can purchase credits
- All workflows integrate seamlessly

---

## **🎉 Congratulations!**

You've now tested the complete Blue Carbon Registry platform across all user roles. The system demonstrates:

- **Multi-role authentication system**
- **Project lifecycle management**
- **Government compliance workflows** 
- **Carbon credit marketplace**
- **Blockchain integration readiness**
- **Comprehensive reporting system**

**Next Steps**: The platform is ready for production deployment with additional security hardening and performance optimization.

---

## **📞 Support**

If you encounter any issues during testing:
1. Check browser console for errors
2. Verify both servers are running
3. Test with different user accounts
4. Clear browser cache if needed

**Happy Testing! 🌊🌱**