import { Router } from 'express';
import { authenticateCustomer, checkAdminRole } from '../middleware/auth';
import { executeQuery, buildWhereClause, buildPagination } from '../utils/database';
// TaskService removed - no longer managing tasks

const router = Router();

// Submit quote request (public)
router.post('/', async (req, res) => {
  try {
    const {
      eventType, eventDate, eventTime, city, venue, guestCount,
      arrangements, style, colorPalette, preferredFlowers, moodboardUrl,
      deliveryRequired, setupRequired, teardownRequired, pickupOption,
      addOns, allergies, ecoFriendly, minBudget, maxBudget,
      customerName, customerEmail, customerPhone, additionalNotes
    } = req.body;

    if (!customerName || !customerEmail || !eventType || !eventDate) {
      return res.status(400).json({ 
        message: 'Customer name, email, event type, and event date are required' 
      });
    }

    // Insert quote request
    const insertQuery = `
      INSERT INTO quote_requests (
        event_type, event_date, event_time, city, venue, guest_count,
        arrangements, style, color_palette, preferred_flowers, moodboard_url,
        delivery_required, setup_required, teardown_required, pickup_option,
        add_ons, allergies, eco_friendly, min_budget, max_budget,
        customer_name, customer_email, customer_phone, additional_notes,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22, $23, $24, NOW(), NOW()
      ) RETURNING id
    `;

    const params = [
      eventType, eventDate, eventTime, city, venue, guestCount,
      JSON.stringify(arrangements), style, colorPalette, 
      JSON.stringify(preferredFlowers), moodboardUrl,
      deliveryRequired, setupRequired, teardownRequired, pickupOption,
      JSON.stringify(addOns), allergies, ecoFriendly, minBudget, maxBudget,
      customerName, customerEmail, customerPhone, additionalNotes
    ];

    const result = await executeQuery(insertQuery, params);
    const quoteRequestId = result.rows[0].id;

    // Task management system removed - quote request submitted successfully

    res.status(201).json({
      message: 'Quote request submitted successfully',
      quoteRequestId
    });
  } catch (error) {
    console.error('Quote submission error:', error);
    res.status(500).json({ message: 'Failed to submit quote request' });
  }
});

// Admin routes (require authentication)
router.use(authenticateCustomer, checkAdminRole);

// Get quote requests (admin only)
router.get('/', async (req, res) => {
  try {
    const { status, eventType, city, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT *
      FROM quote_requests 
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;
    
    if (status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }
    
    if (eventType) {
      query += ` AND event_type = $${paramIndex++}`;
      params.push(eventType);
    }
    
    if (city) {
      query += ` AND city ILIKE $${paramIndex++}`;
      params.push(`%${city}%`);
    }
    
    const pagination = buildPagination(Number(limit), Number(offset));
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(pagination.limit, pagination.offset);
    
    const result = await executeQuery(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching quote requests:', error);
    res.status(500).json({ message: 'Failed to fetch quote requests' });
  }
});

// Get single quote request
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT qr.*
      FROM quote_requests qr 
      WHERE qr.id = $1
    `;
    
    const result = await executeQuery(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Quote request not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching quote request:', error);
    res.status(500).json({ message: 'Failed to fetch quote request' });
  }
});

// Update quote request status
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, estimatedPrice } = req.body;
    
    const updateFields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;
    
    if (status) {
      updateFields.push(`status = $${paramIndex++}`);
      params.push(status);
    }
    
    if (adminNotes !== undefined) {
      updateFields.push(`admin_notes = $${paramIndex++}`);
      params.push(adminNotes);
    }
    
    if (estimatedPrice !== undefined) {
      updateFields.push(`estimated_price = $${paramIndex++}`);
      params.push(estimatedPrice);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    
    updateFields.push(`updated_at = NOW()`);
    params.push(id);
    
    const updateQuery = `
      UPDATE quote_requests 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const result = await executeQuery(updateQuery, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Quote request not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating quote request:', error);
    res.status(500).json({ message: 'Failed to update quote request' });
  }
});

// Delete quote request
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if quote request exists
    const checkQuery = 'SELECT id FROM quote_requests WHERE id = $1';
    const checkResult = await executeQuery(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Quote request not found' });
    }
    
    // No tasks to delete - task management system removed
    
    // Delete quote request
    const deleteQuery = 'DELETE FROM quote_requests WHERE id = $1';
    await executeQuery(deleteQuery, [id]);
    
    res.json({ message: 'Quote request deleted successfully' });
  } catch (error) {
    console.error('Error deleting quote request:', error);
    res.status(500).json({ message: 'Failed to delete quote request' });
  }
});

export default router;