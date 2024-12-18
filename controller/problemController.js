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
            .select('title imageUrl user donationNeeded donationReceived volunteerNeeded volunteerReceived')
            .populate('user', 'name')
            .skip((page - 1) * limit)
            .limit(limit);

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

const detailProblem = async (req, res) => {
    try {
        const { id } = req.params;  // Extract the problem ID from URL parameters

        // Find the problem by ID in the database
        const problem = await Problem.findById(id).populate('user', 'name');

        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        res.status(200).json(problem);
    } catch (error) {
        console.error('Error fetching problem details:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};


module.exports = { createProblem, getProblems, detailProblem };
