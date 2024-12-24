const Problem = require('../models/problemModels');

// Helper function to format numbers to Rupiah
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
};


// Create a problem
const createProblem = async (req, res) => {
    const { title, description, location, donationNeeded, volunteerNeeded, expiryDate} = req.body;
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
            expiryDate
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
        const { page = 1, limit = 10 } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        // Fetch problems with pagination
        const problems = await Problem.find()
            .select('title imageUrl user donationNeeded donationReceived volunteerNeeded volunteerReceived')
            .populate('user', 'name')
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);

        const totalProblems = await Problem.countDocuments();

        // Format problems for response
        const formattedProblems = problems.map(problem => ({
            id: problem._id,
            title: problem.title,
            imageUrl: problem.imageUrl,
            donationNeeded: problem.donationNeeded,
            donationReceived: problem.donationReceived,
            volunteerNeeded: problem.volunteerNeeded,
            volunteerReceived: problem.volunteerReceived,
            user: problem.user ? { id: problem.user._id, name: problem.user.name } : null
        }));

        res.status(200).json({
            totalProblems,
            currentPage: pageNum,
            totalPages: Math.ceil(totalProblems / limitNum),
            problems: formattedProblems
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
