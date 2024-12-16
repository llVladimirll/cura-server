const Problem = require('../models/problemModels');

// Helper function to format numbers to Rupiah
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
};


// Create a problem
const createProblem = async (req, res) => {
    const { title, description, location, donationNeeded, volunteerNeeded } = req.body;
    const user = req.user;

    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const imageUrl = req.file?.path || req.file?.url;

        console.log('Uploaded Image URL:', imageUrl);

        const newProblem = new Problem({
            title,
            imageUrl,
            user,
            description,
            location,
            donationNeeded,
            volunteerNeeded,
        });

        const savedProblem = await newProblem.save();

        const populatedProblem = await Problem.findById(savedProblem._id).populate({
            path: 'user',
            select: 'name',
        });

        res.status(201).json(populatedProblem);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all problems
const getProblems = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query; // Get page and limit from query parameters

        const problems = await Problem.find()
            .select('title imageUrl user donationNeeded') // Include donationNeeded in the selection
            .populate('user', 'name') // Populate userId with specific fields
            .skip((page - 1) * limit) // Skip documents for pagination
            .limit(limit); // Limit the number of documents returned

        const formattedProblems = problems.map((problem) => ({
            ...problem.toObject(),
            donationNeeded: formatRupiah(problem.donationNeeded),
        }));

        const totalProblems = await Problem.countDocuments(); // Get total number of problems

        res.status(200).json({
            totalProblems,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalProblems / limit),
            problems: formattedProblems,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { createProblem, getProblems };
