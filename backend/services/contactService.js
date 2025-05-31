const Contact = require('../models/Contact');
const { 
  CONTACT_STATUSES, 
  LEAD_SOURCES, 
  PRIORITY_LEVELS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  PAGINATION_DEFAULTS
} = require('../utils/constants');
const ValidationHelper = require('../utils/validationHelper');

class ContactService {
  /**
   * Get contact statistics for dashboard
   */
  static async getContactStats(userId) {
    try {
      const userFilter = ValidationHelper.buildUserAccessFilter(userId);
      const baseQuery = { ...userFilter, isDeleted: false };

      const [
        totalContacts,
        activeContacts,
        prospects,
        customers,
        recentContacts,
        contactsBySource,
        contactsByPriority
      ] = await Promise.all([
        // Total contacts
        Contact.countDocuments(baseQuery),
        
        // Active contacts
        Contact.countDocuments({ ...baseQuery, status: CONTACT_STATUSES.ACTIVE }),
        
        // Prospects
        Contact.countDocuments({ ...baseQuery, status: CONTACT_STATUSES.PROSPECT }),
        
        // Customers
        Contact.countDocuments({ ...baseQuery, status: CONTACT_STATUSES.CUSTOMER }),
        
        // Recent contacts (last 30 days)
        Contact.countDocuments({
          ...baseQuery,
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }),
        
        // Contacts by lead source
        Contact.aggregate([
          { $match: baseQuery },
          { $group: { _id: '$leadSource', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        
        // Contacts by priority
        Contact.aggregate([
          { $match: baseQuery },
          { $group: { _id: '$priority', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ])
      ]);

      return {
        totalContacts,
        activeContacts,
        prospects,
        customers,
        recentContacts,
        contactsBySource,
        contactsByPriority,
        conversionRate: totalContacts > 0 ? ((customers / totalContacts) * 100).toFixed(2) : 0
      };
    } catch (error) {
      throw new Error(`Failed to get contact statistics: ${error.message}`);
    }
  }

  /**
   * Get all contacts with filtering, pagination, and sorting
   */
  static async getAllContacts(userId, filters = {}) {
    try {
      const {
        page = PAGINATION_DEFAULTS.PAGE,
        limit = PAGINATION_DEFAULTS.LIMIT,
        search,
        status,
        priority,
        leadSource,
        assignedTo,
        tags,
        createdFrom,
        createdTo,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      // Sanitize pagination
      const { page: sanitizedPage, limit: sanitizedLimit, skip } = ValidationHelper.sanitizePagination({ page, limit });

      // Build base query with user access filter
      const query = {
        ...ValidationHelper.buildUserAccessFilter(userId),
        isDeleted: false
      };

      // Add filters
      if (status) query.status = status;
      if (priority) query.priority = priority;
      if (leadSource) query.leadSource = leadSource;
      if (assignedTo) query.assignedTo = assignedTo;

      // Add date range filter
      const dateFilter = ValidationHelper.buildDateRangeFilter(createdFrom, createdTo, 'createdAt');
      if (Object.keys(dateFilter).length > 0) Object.assign(query, dateFilter);

      // Add text search
      const searchFilter = ValidationHelper.buildTextSearchFilter(search);
      if (Object.keys(searchFilter).length > 0) Object.assign(query, searchFilter);

      // Add tags filter
      const tagsFilter = ValidationHelper.buildTagsFilter(tags);
      if (Object.keys(tagsFilter).length > 0) Object.assign(query, tagsFilter);

      // Build sort object
      const sortOptions = ValidationHelper.buildSortObject(sortBy, sortOrder);

      // Execute queries in parallel
      const [contacts, totalContacts] = await Promise.all([
        Contact.find(query)
          .sort(sortOptions)
          .skip(skip)
          .limit(sanitizedLimit)
          .populate('assignedTo', 'firstName lastName email')
          .populate('createdBy', 'firstName lastName')
          .lean(),
        Contact.countDocuments(query)
      ]);

      // Calculate pagination metadata
      const paginationMeta = ValidationHelper.calculatePaginationMetadata(
        totalContacts,
        sanitizedPage,
        sanitizedLimit
      );

      return {
        contacts,
        pagination: paginationMeta
      };
    } catch (error) {
      throw new Error(`Failed to get contacts: ${error.message}`);
    }
  }

  /**
   * Get a single contact by ID
   */
  static async getContactById(contactId, userId) {
    try {
      const userFilter = ValidationHelper.buildUserAccessFilter(userId);
      
      const contact = await Contact.findOne({
        _id: contactId,
        ...userFilter,
        isDeleted: false
      })
        .populate('assignedTo', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName')
        .lean();

      if (!contact) {
        throw new Error(ERROR_MESSAGES.CONTACT_NOT_FOUND);
      }

      return contact;
    } catch (error) {
      if (error.message === ERROR_MESSAGES.CONTACT_NOT_FOUND) {
        throw error;
      }
      throw new Error(`Failed to get contact: ${error.message}`);
    }
  }

  /**
   * Create a new contact
   */
  static async createContact(contactData, userId) {
    try {
      // Check for duplicate email
      const existingContact = await Contact.findOne({
        email: contactData.email,
        isDeleted: false
      });

      if (existingContact) {
        throw new Error('A contact with this email already exists');
      }

      // Set default values
      const contact = new Contact({
        ...contactData,
        createdBy: userId,
        assignedTo: contactData.assignedTo || userId,
        status: contactData.status || CONTACT_STATUSES.PROSPECT,
        priority: contactData.priority || PRIORITY_LEVELS.MEDIUM,
        leadSource: contactData.leadSource || LEAD_SOURCES.OTHER
      });

      const savedContact = await contact.save();

      // Populate references for response
      const populatedContact = await Contact.findById(savedContact._id)
        .populate('assignedTo', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName')
        .lean();

      return populatedContact;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('A contact with this email already exists');
      }
      throw new Error(`Failed to create contact: ${error.message}`);
    }
  }

  /**
   * Update a contact
   */
  static async updateContact(contactId, updateData, userId) {
    try {
      const userFilter = ValidationHelper.buildUserAccessFilter(userId);

      // Check if contact exists and user has access
      const existingContact = await Contact.findOne({
        _id: contactId,
        ...userFilter,
        isDeleted: false
      });

      if (!existingContact) {
        throw new Error(ERROR_MESSAGES.CONTACT_NOT_FOUND);
      }

      // Check for email conflicts if email is being updated
      if (updateData.email && updateData.email !== existingContact.email) {
        const emailConflict = await Contact.findOne({
          email: updateData.email,
          _id: { $ne: contactId },
          isDeleted: false
        });

        if (emailConflict) {
          throw new Error('A contact with this email already exists');
        }
      }

      // Update the contact
      const updatedContact = await Contact.findByIdAndUpdate(
        contactId,
        {
          ...updateData,
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      )
        .populate('assignedTo', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName')
        .lean();

      return updatedContact;
    } catch (error) {
      if (error.message === ERROR_MESSAGES.CONTACT_NOT_FOUND) {
        throw error;
      }
      if (error.code === 11000) {
        throw new Error('A contact with this email already exists');
      }
      throw new Error(`Failed to update contact: ${error.message}`);
    }
  }

  /**
   * Soft delete a contact
   */
  static async deleteContact(contactId, userId) {
    try {
      const userFilter = ValidationHelper.buildUserAccessFilter(userId);

      const contact = await Contact.findOne({
        _id: contactId,
        ...userFilter,
        isDeleted: false
      });

      if (!contact) {
        throw new Error(ERROR_MESSAGES.CONTACT_NOT_FOUND);
      }

      // Soft delete
      await Contact.findByIdAndUpdate(contactId, {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId
      });

      return { message: SUCCESS_MESSAGES.DELETED };
    } catch (error) {
      if (error.message === ERROR_MESSAGES.CONTACT_NOT_FOUND) {
        throw error;
      }
      throw new Error(`Failed to delete contact: ${error.message}`);
    }
  }

  /**
   * Restore a soft-deleted contact
   */
  static async restoreContact(contactId, userId) {
    try {
      const userFilter = ValidationHelper.buildUserAccessFilter(userId);

      const contact = await Contact.findOne({
        _id: contactId,
        ...userFilter,
        isDeleted: true
      });

      if (!contact) {
        throw new Error('Contact not found or not deleted');
      }

      // Restore contact
      const restoredContact = await Contact.findByIdAndUpdate(
        contactId,
        {
          isDeleted: false,
          $unset: { deletedAt: 1, deletedBy: 1 },
          updatedAt: new Date()
        },
        { new: true }
      )
        .populate('assignedTo', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName')
        .lean();

      return restoredContact;
    } catch (error) {
      throw new Error(`Failed to restore contact: ${error.message}`);
    }
  }

  /**
   * Add tags to a contact
   */
  static async addTags(contactId, tags, userId) {
    try {
      const userFilter = ValidationHelper.buildUserAccessFilter(userId);

      const contact = await Contact.findOne({
        _id: contactId,
        ...userFilter,
        isDeleted: false
      });

      if (!contact) {
        throw new Error(ERROR_MESSAGES.CONTACT_NOT_FOUND);
      }

      // Add unique tags
      const uniqueTags = [...new Set([...(contact.tags || []), ...tags])];

      const updatedContact = await Contact.findByIdAndUpdate(
        contactId,
        { 
          tags: uniqueTags,
          updatedAt: new Date()
        },
        { new: true }
      )
        .populate('assignedTo', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName')
        .lean();

      return updatedContact;
    } catch (error) {
      if (error.message === ERROR_MESSAGES.CONTACT_NOT_FOUND) {
        throw error;
      }
      throw new Error(`Failed to add tags: ${error.message}`);
    }
  }

  /**
   * Remove a tag from a contact
   */
  static async removeTag(contactId, tag, userId) {
    try {
      const userFilter = ValidationHelper.buildUserAccessFilter(userId);

      const contact = await Contact.findOne({
        _id: contactId,
        ...userFilter,
        isDeleted: false
      });

      if (!contact) {
        throw new Error(ERROR_MESSAGES.CONTACT_NOT_FOUND);
      }

      if (!contact.tags || !contact.tags.includes(tag)) {
        throw new Error(ERROR_MESSAGES.TAG_NOT_FOUND);
      }

      // Remove tag
      const updatedTags = contact.tags.filter(t => t !== tag);

      const updatedContact = await Contact.findByIdAndUpdate(
        contactId,
        { 
          tags: updatedTags,
          updatedAt: new Date()
        },
        { new: true }
      )
        .populate('assignedTo', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName')
        .lean();

      return updatedContact;
    } catch (error) {
      if (error.message === ERROR_MESSAGES.CONTACT_NOT_FOUND || 
          error.message === ERROR_MESSAGES.TAG_NOT_FOUND) {
        throw error;
      }
      throw new Error(`Failed to remove tag: ${error.message}`);
    }
  }

  /**
   * Bulk operations on contacts
   */
  static async bulkOperation(contactIds, operation, value, userId) {
    try {
      const userFilter = ValidationHelper.buildUserAccessFilter(userId);

      // Verify all contacts exist and user has access
      const contacts = await Contact.find({
        _id: { $in: contactIds },
        ...userFilter,
        isDeleted: false
      });

      if (contacts.length !== contactIds.length) {
        throw new Error('Some contacts not found or access denied');
      }

      let updateQuery = { updatedAt: new Date() };

      switch (operation) {
        case 'delete':
          updateQuery = {
            isDeleted: true,
            deletedAt: new Date(),
            deletedBy: userId
          };
          break;
        case 'restore':
          updateQuery = {
            isDeleted: false,
            $unset: { deletedAt: 1, deletedBy: 1 },
            updatedAt: new Date()
          };
          break;
        case 'updateStatus':
          updateQuery.status = value;
          break;
        case 'updatePriority':
          updateQuery.priority = value;
          break;
        case 'assignTo':
          updateQuery.assignedTo = value;
          break;
        default:
          throw new Error('Invalid bulk operation');
      }

      const result = await Contact.updateMany(
        { _id: { $in: contactIds } },
        updateQuery
      );

      return {
        message: `Bulk operation completed successfully`,
        modifiedCount: result.modifiedCount
      };
    } catch (error) {
      throw new Error(`Bulk operation failed: ${error.message}`);
    }
  }

  /**
   * Get deleted contacts (for admin/restore purposes)
   */
  static async getDeletedContacts(userId, filters = {}) {
    try {
      const {
        page = PAGINATION_DEFAULTS.PAGE,
        limit = PAGINATION_DEFAULTS.LIMIT,
        search,
        sortBy = 'deletedAt',
        sortOrder = 'desc'
      } = filters;

      const { sanitizedPage, sanitizedLimit, skip } = ValidationHelper.sanitizePagination({ page, limit });

      const query = {
        ...ValidationHelper.buildUserAccessFilter(userId),
        isDeleted: true
      };

      // Add text search
      const searchFilter = ValidationHelper.buildTextSearchFilter(search);
      if (Object.keys(searchFilter).length > 0) Object.assign(query, searchFilter);

      const sortOptions = ValidationHelper.buildSortObject(sortBy, sortOrder);

      const [contacts, totalContacts] = await Promise.all([
        Contact.find(query)
          .sort(sortOptions)
          .skip(skip)
          .limit(sanitizedLimit)
          .populate('assignedTo', 'firstName lastName email')
          .populate('createdBy', 'firstName lastName')
          .populate('deletedBy', 'firstName lastName')
          .lean(),
        Contact.countDocuments(query)
      ]);

      const paginationMeta = ValidationHelper.calculatePaginationMetadata(
        totalContacts,
        sanitizedPage,
        sanitizedLimit
      );

      return {
        contacts,
        pagination: paginationMeta
      };
    } catch (error) {
      throw new Error(`Failed to get deleted contacts: ${error.message}`);
    }
  }
}

module.exports = ContactService; 