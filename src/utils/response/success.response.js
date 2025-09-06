export const successResponse = ({ res, message, data, status } = {}) => {
    return res.status(status || 200).json({ successMessage: message || "Done", data })
}