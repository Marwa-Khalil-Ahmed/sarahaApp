import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connect(process.env.DB_URI);
        console.log('DB Connected');
    } catch (error) {
        console.log('DB fail to Connect');
    }
};
export default connectDB;