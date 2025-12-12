const Event = require('../models/Event');

// Get all events for a user
exports.getEvents = async (req, res, next) => {
  try {
    const { start, end } = req.query;
    let query = { userId: req.userId };
    
    // Filter by date range if provided
    if (start && end) {
      query.startDate = {
        $gte: new Date(start),
        $lte: new Date(end)
      };
    }
    
    const events = await Event.find(query)
      .sort({ startDate: 1 });
    
    res.status(200).json(events);
  } catch (error) {
    next(error);
  }
};

// Get single event by ID
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });
    
    if (!event) {
      const error = new Error('Event not found');
      error.statusCode = 404;
      throw error;
    }
    
    res.status(200).json(event);
  } catch (error) {
    next(error);
  }
};

// Create new event
exports.createEvent = async (req, res, next) => {
  try {
    const { 
      title, 
      description, 
      startDate, 
      endDate, 
      allDay, 
      type, 
      priority, 
      status, 
      color
    } = req.body;
    
    // Ensure type has a default value if not provided or empty
    const eventType = type && type.trim() ? type.trim() : 'Event';
    
    // Ensure dates are properly parsed and handled
    // Parse dates correctly to avoid timezone issues
    const parseDate = (dateStr) => {
      // If the date string ends with 'Z', it's already in UTC
      if (dateStr.endsWith('Z')) {
        return new Date(dateStr);
      }
      
      // Otherwise, extract the date part and create a local date
      const datePart = dateStr.split('T')[0];
      const [year, month, day] = datePart.split('-').map(Number);
      
      // Create date in local timezone
      const localDate = new Date(year, month - 1, day);
      
      // Set the time to midnight in local timezone
      localDate.setHours(0, 0, 0, 0);
      
      return localDate;
    };
    
    const parsedStartDate = parseDate(startDate);
    const parsedEndDate = parseDate(endDate);
    
    console.log('Backend creating event with dates:', {
      originalStartDate: startDate,
      originalEndDate: endDate,
      parsedStartDate: parsedStartDate.toISOString(),
      parsedEndDate: parsedEndDate.toISOString()
    });
    
    const event = new Event({
      userId: req.userId,
      title,
      description,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      allDay,
      type: eventType,
      priority,
      status,
      color
    });
    
    const savedEvent = await event.save();
    
    res.status(201).json(savedEvent);
  } catch (error) {
    next(error);
  }
};

// Update event
exports.updateEvent = async (req, res, next) => {
  try {
    const { 
      title, 
      description, 
      startDate, 
      endDate, 
      allDay, 
      type, 
      priority, 
      status, 
      color
    } = req.body;
    
    // Ensure type has a default value if not provided or empty
    const eventType = type && type.trim() ? type.trim() : 'Event';
    
    // Ensure dates are properly parsed and handled
    // Parse dates correctly to avoid timezone issues
    const parseDate = (dateStr) => {
      // If the date string ends with 'Z', it's already in UTC
      if (dateStr.endsWith('Z')) {
        return new Date(dateStr);
      }
      
      // Otherwise, extract the date part and create a local date
      const datePart = dateStr.split('T')[0];
      const [year, month, day] = datePart.split('-').map(Number);
      
      // Create date in local timezone
      const localDate = new Date(year, month - 1, day);
      
      // Set the time to midnight in local timezone
      localDate.setHours(0, 0, 0, 0);
      
      return localDate;
    };
    
    const parsedStartDate = parseDate(startDate);
    const parsedEndDate = parseDate(endDate);
    
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      {
        title,
        description,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        allDay,
        type: eventType,
        priority,
        status,
        color
      },
      { new: true, runValidators: true }
    );
    
    if (!event) {
      const error = new Error('Event not found');
      error.statusCode = 404;
      throw error;
    }
    
    res.status(200).json(event);
  } catch (error) {
    next(error);
  }
};

// Delete event
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.userId 
    });
    
    if (!event) {
      const error = new Error('Event not found');
      error.statusCode = 404;
      throw error;
    }
    
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get events by date range
exports.getEventsByDateRange = async (req, res, next) => {
  try {
    const { start, end } = req.params;
    
    const events = await Event.find({
      userId: req.userId,
      startDate: {
        $gte: new Date(start),
        $lte: new Date(end)
      }
    })
    .sort({ startDate: 1 });
    
    res.status(200).json(events);
  } catch (error) {
    next(error);
  }
};

// Get events by type
exports.getEventsByType = async (req, res, next) => {
  try {
    const events = await Event.find({
      userId: req.userId,
      type: req.params.type
    })
    .sort({ startDate: 1 });
    
    res.status(200).json(events);
  } catch (error) {
    next(error);
  }
};

// Update event status
exports.updateEventStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { status },
      { new: true, runValidators: true }
    );
    
    if (!event) {
      const error = new Error('Event not found');
      error.statusCode = 404;
      throw error;
    }
    
    res.status(200).json(event);
  } catch (error) {
    next(error);
  }
}; 