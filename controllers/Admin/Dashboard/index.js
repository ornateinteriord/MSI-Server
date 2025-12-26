const MemberModel = require("../../../models/member.model");
const AccountsModel = require("../../../models/accounts.model");
const AgentModel = require("../../../models/agent.model");

// Get dashboard counts
const getDashboardCounts = async (req, res) => {
    try {
        // Get total members count
        const totalMembers = await MemberModel.countDocuments({ status: "active" });

        // Get total agents count
        const totalAgents = await AgentModel.countDocuments({ status: "active" });

        // Get total accounts count
        const totalAccounts = await AccountsModel.countDocuments();

        // Get accounts grouped by account_type (account_group_id) with account_group_name
        const accountsByType = await AccountsModel.aggregate([
            {
                $group: {
                    _id: "$account_type",
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "account_group_tbl",
                    localField: "_id",
                    foreignField: "account_group_id",
                    as: "groupInfo"
                }
            },
            {
                $unwind: {
                    path: "$groupInfo",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 0,
                    account_type: "$_id",
                    account_group_name: "$groupInfo.account_group_name",
                    count: 1
                }
            },
            {
                $sort: { account_type: 1 }
            }
        ]);

        res.status(200).json({
            success: true,
            message: "Dashboard counts fetched successfully",
            data: {
                totalMembers,
                totalAccounts,
                totalAgents,
                accountsByType
            }
        });
    } catch (error) {
        console.error("Error fetching dashboard counts:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard counts",
            error: error.message
        });
    }
};

// Get recent accounts and members
const getRecentData = async (req, res) => {
    try {
        // Get recent 10 accounts sorted by creation date
        const recentAccounts = await AccountsModel.find()
            .sort({ createdAt: -1 })
            .limit(6)
            .lean();

        // Get recent 10 members sorted by creation date
        const recentMembers = await MemberModel.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        res.status(200).json({
            success: true,
            message: "Recent data fetched successfully",
            data: {
                recentAccounts,
                recentMembers
            }
        });
    } catch (error) {
        console.error("Error fetching recent data:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch recent data",
            error: error.message
        });
    }
};

module.exports = {
    getDashboardCounts,
    getRecentData
};
