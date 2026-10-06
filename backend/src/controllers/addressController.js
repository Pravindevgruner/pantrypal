const Address = require('../models/Address');
const { sendSuccess, sendError } = require('../utils/response');

const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    return sendSuccess(res, 'Addresses fetched', { addresses });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const createAddress = async (req, res) => {
  try {
    const { fullName, phone, houseFlat, street, area, city, state, pincode, latitude, longitude, type, isDefault } = req.body;

    if (!fullName || !phone || !houseFlat || !area || !city || !state || !pincode) {
      return sendError(res, 'Please provide all required address fields', {}, 400);
    }

    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const count = await Address.countDocuments({ user: req.user._id });

    const address = await Address.create({
      user: req.user._id,
      fullName,
      phone,
      houseFlat,
      street: street || '',
      area,
      city,
      state,
      pincode,
      latitude: latitude || 28.6139,
      longitude: longitude || 77.2090,
      type: type || 'Home',
      isDefault: isDefault || count === 0, // auto default first address
    });

    return sendSuccess(res, 'Address created successfully', { address }, 201);
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await Address.findOne({ _id: id, user: req.user._id });
    if (!address) return sendError(res, 'Address not found', {}, 404);

    if (req.body.isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const fields = ['fullName', 'phone', 'houseFlat', 'street', 'area', 'city', 'state', 'pincode', 'latitude', 'longitude', 'type', 'isDefault'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        address[field] = req.body[field];
      }
    });

    await address.save();
    return sendSuccess(res, 'Address updated successfully', { address });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await Address.findOne({ _id: id, user: req.user._id });
    if (!address) return sendError(res, 'Address not found', {}, 404);

    await address.deleteOne();
    return sendSuccess(res, 'Address deleted successfully');
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

module.exports = {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
};
