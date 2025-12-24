const MemberModel = require("../../../models/member.model");
const UserModel = require("../../../models/user.model");

// Create a new member
const createMember = async (req, res) => {
    try {
        const {
            branch_id,
            date_of_joining,
            receipt_no,
            name,
            father_name,
            gender,
            dob,
            age,
            address,
            emailid,
            contactno,
            pan_no,
            aadharcard_no,
            voter_id,
            nominee,
            relation,
            occupation,
            introducer,
            introducer_name,
            member_image,
            member_signature,
            entered_by,
            role,
            status
        } = req.body;

        // Auto-increment member_id: Find max member_id and add 1
        const lastMember = await MemberModel.findOne()
            .sort({ member_id: -1 })
            .limit(1);

        let newMemberId = "1";
        if (lastMember && lastMember.member_id) {
            // Extract numeric part and increment
            const lastId = parseInt(lastMember.member_id);
            if (!isNaN(lastId)) {
                newMemberId = (lastId + 1).toString();
            }
        }

        // Check if contactno already exists
        if (contactno) {
            const existingContact = await MemberModel.findOne({ contactno });
            if (existingContact) {
                return res.status(400).json({
                    success: false,
                    message: "Contact number already exists"
                });
            }
        }

        // Create new member with auto-generated member_id
        const newMember = await MemberModel.create({
            member_id: newMemberId,
            branch_id,
            date_of_joining,
            receipt_no,
            name,
            father_name,
            gender,
            dob,
            age,
            address,
            emailid,
            contactno,
            pan_no,
            aadharcard_no,
            voter_id,
            nominee,
            relation,
            occupation,
            introducer,
            introducer_name,
            member_image,
            member_signature,
            entered_by,
            role: role || "USER",
            status: status || "active"
        });

        // Create user entry automatically
        try {
            // Find the last user_id to auto-increment
            const lastUser = await UserModel.findOne()
                .sort({ user_id: -1 })
                .limit(1);

            let newUserId = "1";
            if (lastUser && lastUser.user_id) {
                const lastId = parseInt(lastUser.user_id);
                if (!isNaN(lastId)) {
                    newUserId = (lastId + 1).toString();
                }
            }

            await UserModel.create({
                user_id: newUserId,
                user_name: newMemberId, 
                reference_id: newMemberId,
                password: contactno, 
                user_role: "USER",
                branch_code: branch_id,
                user_status: "active"
            });

            console.log(`User created successfully for member ${newMemberId}`);
        } catch (userError) {
            console.error("Error creating user entry:", userError);
            // Don't fail the member creation if user creation fails
            // Just log the error
        }

        res.status(201).json({
            success: true,
            message: "Member created successfully",
            data: newMember
        });
    } catch (error) {
        console.error("Error creating member:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create member",
            error: error.message
        });
    }
};

// Get all members
const getMembers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, status } = req.query;

        // Build filter object
        const filter = {};
        if (status) {
            filter.status = status;
        }
        if (search) {
            filter.$or = [
                { member_id: { $regex: search, $options: "i" } },
                { name: { $regex: search, $options: "i" } },
                { contactno: { $regex: search, $options: "i" } },
                { emailid: { $regex: search, $options: "i" } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const members = await MemberModel.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalMembers = await MemberModel.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: "Members fetched successfully",
            data: members,
            pagination: {
                total: totalMembers,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(totalMembers / parseInt(limit))
            }
        });
    } catch (error) {
        console.error("Error fetching members:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch members",
            error: error.message
        });
    }
};

// Update a member by ID
const updateMember = async (req, res) => {
    try {
        const { memberId } = req.params;
        const updateData = req.body;

        // Find member by member_id
        const member = await MemberModel.findOne({ member_id: memberId });
        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Member not found"
            });
        }

        // If updating contactno, check if it already exists for another member
        if (updateData.contactno && updateData.contactno !== member.contactno) {
            const existingContact = await MemberModel.findOne({
                contactno: updateData.contactno,
                member_id: { $ne: memberId }
            });
            if (existingContact) {
                return res.status(400).json({
                    success: false,
                    message: "Contact number already exists for another member"
                });
            }
        }

        // Update the member
        const updatedMember = await MemberModel.findOneAndUpdate(
            { member_id: memberId },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Member updated successfully",
            data: updatedMember
        });
    } catch (error) {
        console.error("Error updating member:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update member",
            error: error.message
        });
    }
};

// Get a single member by ID
const getMemberById = async (req, res) => {
    try {
        const { memberId } = req.params;

        const member = await MemberModel.findOne({ member_id: memberId });
        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Member not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Member fetched successfully",
            data: member
        });
    } catch (error) {
        console.error("Error fetching member:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch member",
            error: error.message
        });
    }
};

module.exports = {
    createMember,
    getMembers,
    updateMember,
    getMemberById
};
