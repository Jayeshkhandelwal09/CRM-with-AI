const Contact = require('../models/Contact');
const logger = require('../utils/logger');

/**
 * Get all contacts for the authenticated user with pagination
 * GET /api/contacts
 */
const getContacts = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query filters
    const query = { owner: userId, isDuplicate: false };

    // Add search functionality
    if (req.query.search) {
      const searchTerm = req.query.search;
      query.$or = [
        { firstName: new RegExp(searchTerm, 'i') },
        { lastName: new RegExp(searchTerm, 'i') },
        { email: new RegExp(searchTerm, 'i') },
        { company: new RegExp(searchTerm, 'i') },
        { jobTitle: new RegExp(searchTerm, 'i') },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } }
      ];
    }

    // Add status filter
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Add company filter
    if (req.query.company) {
      query.company = new RegExp(req.query.company, 'i');
    }

    // Add tags filter
    if (req.query.tags) {
      const tags = Array.isArray(req.query.tags) ? req.query.tags : [req.query.tags];
      query.tags = { $in: tags };
    }

    // Sort options
    let sortOption = { createdAt: -1 }; // Default sort by newest
    if (req.query.sortBy) {
      switch (req.query.sortBy) {
        case 'name':
          sortOption = { firstName: 1, lastName: 1 };
          break;
        case 'company':
          sortOption = { company: 1 };
          break;
        case 'lastContact':
          sortOption = { lastContactDate: -1 };
          break;
        case 'nextFollowUp':
          sortOption = { nextFollowUpDate: 1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
    }

    // Execute query with pagination
    const [contacts, totalContacts] = await Promise.all([
      Contact.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .select('-__v')
        .lean(),
      Contact.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalContacts / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    logger.info(`Retrieved ${contacts.length} contacts for user ${userId}`, {
      userId,
      page,
      limit,
      totalContacts,
      filters: req.query
    });

    res.status(200).json({
      success: true,
      data: {
        contacts,
        pagination: {
          currentPage: page,
          totalPages,
          totalContacts,
          hasNextPage,
          hasPrevPage,
          limit
        }
      }
    });

  } catch (error) {
    logger.error('Error retrieving contacts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve contacts'
    });
  }
};

/**
 * Get a single contact by ID
 * GET /api/contacts/:id
 */
const getContactById = async (req, res) => {
  try {
    const userId = req.user.id;
    const contactId = req.params.id;

    const contact = await Contact.findOne({
      _id: contactId,
      owner: userId,
      isDuplicate: false
    }).select('-__v');

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    logger.info(`Retrieved contact ${contactId} for user ${userId}`);

    res.status(200).json({
      success: true,
      data: contact
    });

  } catch (error) {
    logger.error('Error retrieving contact:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid contact ID format'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve contact'
    });
  }
};

/**
 * Create a new contact
 * POST /api/contacts
 */
const createContact = async (req, res) => {
  try {
    const userId = req.user.id;
    const contactData = {
      ...req.body,
      owner: userId
    };

    // Check for potential duplicates before creating
    if (contactData.email) {
      const existingContact = await Contact.findOne({
        email: contactData.email.toLowerCase(),
        owner: userId,
        isDuplicate: false
      });

      if (existingContact) {
        return res.status(409).json({
          success: false,
          error: 'A contact with this email already exists',
          existingContact: {
            id: existingContact._id,
            fullName: existingContact.fullName,
            email: existingContact.email
          }
        });
      }
    }

    // Create the contact
    const contact = new Contact(contactData);
    await contact.save();

    logger.info(`Created new contact ${contact._id} for user ${userId}`, {
      userId,
      contactId: contact._id,
      email: contact.email
    });

    res.status(201).json({
      success: true,
      message: 'Contact created successfully',
      data: contact
    });

  } catch (error) {
    logger.error('Error creating contact:', error);

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create contact'
    });
  }
};

/**
 * Update a contact by ID
 * PUT /api/contacts/:id
 */
const updateContact = async (req, res) => {
  try {
    const userId = req.user.id;
    const contactId = req.params.id;
    const updateData = { ...req.body };

    // Remove fields that shouldn't be updated directly
    delete updateData.owner;
    delete updateData._id;
    delete updateData.__v;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    // Check if contact exists and belongs to user
    const existingContact = await Contact.findOne({
      _id: contactId,
      owner: userId,
      isDuplicate: false
    });

    if (!existingContact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    // Check for email conflicts if email is being updated
    if (updateData.email && updateData.email !== existingContact.email) {
      const emailConflict = await Contact.findOne({
        email: updateData.email.toLowerCase(),
        owner: userId,
        isDuplicate: false,
        _id: { $ne: contactId }
      });

      if (emailConflict) {
        return res.status(409).json({
          success: false,
          error: 'A contact with this email already exists',
          existingContact: {
            id: emailConflict._id,
            fullName: emailConflict.fullName,
            email: emailConflict.email
          }
        });
      }
    }

    // Update the contact
    const updatedContact = await Contact.findByIdAndUpdate(
      contactId,
      updateData,
      {
        new: true,
        runValidators: true,
        select: '-__v'
      }
    );

    logger.info(`Updated contact ${contactId} for user ${userId}`, {
      userId,
      contactId,
      updatedFields: Object.keys(updateData)
    });

    res.status(200).json({
      success: true,
      message: 'Contact updated successfully',
      data: updatedContact
    });

  } catch (error) {
    logger.error('Error updating contact:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid contact ID format'
      });
    }

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update contact'
    });
  }
};

/**
 * Delete a contact by ID
 * DELETE /api/contacts/:id
 */
const deleteContact = async (req, res) => {
  try {
    const userId = req.user.id;
    const contactId = req.params.id;

    // Check if contact exists and belongs to user
    const contact = await Contact.findOne({
      _id: contactId,
      owner: userId,
      isDuplicate: false
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    // Delete the contact
    await Contact.findByIdAndDelete(contactId);

    logger.info(`Deleted contact ${contactId} for user ${userId}`, {
      userId,
      contactId,
      contactName: contact.fullName,
      contactEmail: contact.email
    });

    res.status(200).json({
      success: true,
      message: 'Contact deleted successfully',
      data: {
        deletedContact: {
          id: contact._id,
          fullName: contact.fullName,
          email: contact.email
        }
      }
    });

  } catch (error) {
    logger.error('Error deleting contact:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid contact ID format'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to delete contact'
    });
  }
};

module.exports = {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact
}; 