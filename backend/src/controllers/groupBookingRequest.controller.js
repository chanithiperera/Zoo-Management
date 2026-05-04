const fs = require('fs');
const path = require('path');
const asyncHandler = require('../utils/asyncHandler');
const GroupBookingRequest = require('../models/GroupBookingRequest.model');

const UPLOAD_SUBFOLDER = 'ticket-show-group-letters';

function createRequestCode() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  const stamp = Date.now().toString(36).slice(-4).toUpperCase();
  return `ZG-${stamp}-${random}`;
}

function tryRemoveUploadedFile(file) {
  if (!file?.path) return;
  fs.unlink(file.path, () => {});
}

exports.createGroupRequest = asyncHandler(async (req, res) => {
  const {
    groupType,
    organizationName,
    contactName,
    contactPhone,
    contactEmail,
    visitDate,
    totalPeople,
    adultsCount,
    childrenCount,
    notes,
  } = req.body;

  try {
    const supportingDocument = req.file
      ? {
        fileName: req.file.originalname,
        storedPath: `/uploads/${UPLOAD_SUBFOLDER}/${path.basename(req.file.path)}`,
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size,
      }
      : null;

    const groupRequest = await GroupBookingRequest.create({
      userId: req.user._id,
      groupType,
      organizationName: String(organizationName).trim(),
      contactName: String(contactName).trim(),
      contactPhone: String(contactPhone).trim(),
      contactEmail: String(contactEmail).trim().toLowerCase(),
      visitDate,
      totalPeople: Number(totalPeople),
      adultsCount: Number(adultsCount),
      childrenCount: Number(childrenCount),
      notes: notes ? String(notes).trim() : '',
      supportingDocument,
      status: 'pending',
      requestCode: createRequestCode(),
    });

    res.status(201).json({
      success: true,
      message: 'Group booking request submitted',
      data: { groupRequest },
    });
  } catch (error) {
    tryRemoveUploadedFile(req.file);
    throw error;
  }
});

exports.getMyGroupRequests = asyncHandler(async (req, res) => {
  const groupRequests = await GroupBookingRequest.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    message: 'Group booking requests loaded',
    data: { groupRequests },
  });
});

exports.getGroupRequestById = asyncHandler(async (req, res) => {
  const groupRequest = await GroupBookingRequest.findById(req.params.id).lean();
  if (!groupRequest) {
    throw new AppError('Group booking request not found', 404);
  }

  const isOwner = String(groupRequest.userId) === String(req.user._id);
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    throw new AppError('You do not have permission to view this group request', 403);
  }

  res.status(200).json({
    success: true,
    message: 'Group booking request loaded',
    data: { groupRequest },
  });
});
