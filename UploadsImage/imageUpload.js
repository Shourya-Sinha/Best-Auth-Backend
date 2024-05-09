// const multer = require('multer');
// const storage = multer.diskStorage({});
// const upload = multer({ storage });

const cloudinary = require('../Utils/Cloudinary');
const User = require('../Models/userModel');


exports.uploadImage = async (req, res) =>{
    try {
        const result = await cloudinary.uploader.upload(req.file.path)

        const user =await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.avatar = result.secure_url;
        user.cloudinary_id = result.public_id;
        await user.save();

        return res.status(200).json({
            status:'success',
            message:'iMAGE UPLOADED SUCCESSFULY',
            imageUrl: result.secure_url,
        })
    } catch (error) {
        console.log(error);
    }
}

// const cloudinary = require('cloudinary').v2;
// const dotenv = require('dotenv');
// const User = require('../Models/userModel');

// dotenv.config({ path: '../Config/Config.env' });

// cloudinary.config({
//     cloud_name: process.env.CLOUD_NAME,
//     api_key: process.env.API_KEY,
//     api_secret: process.env.API_SECRET,
// });

// module.exports = {
//     upload, // Export the upload middleware
//     uploadImage: async (req, res) => {
//         try {
//             // Upload image to Cloudinary
//             const result = await cloudinary.uploader.upload(req.file.path);

//             // Save image URL to user's avatar field in MongoDB
//             const user = await User.findById(req.userId); // Assuming you have userId available in the request
//             if (!user) {
//                 return res.status(404).json({ message: 'User not found' });
//             }

//             user.avatar = result.secure_url;
//             await user.save();

//             // Respond with success message and image URL
//             res.status(200).json({ message: 'Image uploaded successfully', imageUrl: result.secure_url });
//         } catch (error) {
//             console.error('Error uploading image:', error);
//             res.status(500).json({ message: 'Error uploading image' });
//         }
//     }
// };
