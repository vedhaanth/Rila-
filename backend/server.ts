import 'dotenv/config';
import { randomUUID, scryptSync, randomBytes, timingSafeEqual } from 'crypto';
import express from 'express';
import cors from 'cors';
import path from 'path';
import mongoose from 'mongoose';
import { createServer as createViteServer } from 'vite';
import { AdminId, OrderStatus, EmailLog } from '../src/types';
import { calculateFinanceMetrics } from '../src/utils/finance.js';
import { connectToDatabase } from '../src/db/connect';

// Crypto helpers using Node.js built-in — no external dependency needed
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 } as const;
const KEY_LEN = 64;

function hashPassword(password: string): string {
  const salt = randomBytes(32).toString('hex');
  const hash = scryptSync(password, salt, KEY_LEN, SCRYPT_PARAMS).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, storedHash] = stored.split(':');
    if (!salt || !storedHash) return false;
    const hash = scryptSync(password, salt, KEY_LEN, SCRYPT_PARAMS);
    return timingSafeEqual(hash, Buffer.from(storedHash, 'hex'));
  } catch {
    return false;
  }
}

import ProductModel from '../src/models/Product';
import OrderModel from '../src/models/Order';
import BillModel from '../src/models/Bill';
import ExpenseModel from '../src/models/Expense';
import SupplierModel from '../src/models/Supplier';
import FeedbackModel from '../src/models/Feedback';
import EmailLogModel from '../src/models/EmailLog';
import AdminModel from '../src/models/Admin';
import CustomerModel from '../src/models/Customer';
import EmployeeModel from '../src/models/Employee';

async function seedDatabase() {
  const db = mongoose.connection.db;
  if (!db) return;

  const collectionNames = ['products', 'orders', 'admins', 'customers', 'bills', 'expenses', 'suppliers', 'feedbacks', 'emaillogs', 'employees'];
  for (const name of collectionNames) {
    try {
      await db.createCollection(name);
    } catch (err: any) {
      if (!/already exists/i.test(err?.message || '')) {
        console.warn(`Unable to create collection ${name}:`, err?.message || err);
      }
    }
  }

  const adminSeedEntries = [
    {
      admin_id: 'admin1',
      admin_name: process.env.ADMIN_1_NAME || 'Apex Tech Admin',
      email: (process.env.ADMIN_1_EMAIL || 'admin1@smartretail.com').toLowerCase(),
      rawPassword: process.env.ADMIN_1_PASSWORD || 'admin123',
      business_name: process.env.ADMIN_1_BUSINESS || 'Apex Tech & Electronics',
      phone: '+1 234 567 8900',
      gstin: '27AADCB2230M1Z2',
      address: '123 Tech Park, Silicon Valley, CA',
      categories: ['Electronics', 'Gadgets']
    },
    {
      admin_id: 'admin2',
      admin_name: process.env.ADMIN_2_NAME || 'Vogue Living Admin',
      email: (process.env.ADMIN_2_EMAIL || 'admin2@smartretail.com').toLowerCase(),
      rawPassword: process.env.ADMIN_2_PASSWORD || 'admin123',
      business_name: process.env.ADMIN_2_BUSINESS || 'Vogue & Living Retail',
      phone: '+1 987 654 3210',
      gstin: '27AADCB2230M1Z3',
      address: '456 Fashion Ave, New York, NY',
      categories: ['Clothing', 'Home']
    }
  ];

  await Promise.all(
    adminSeedEntries.map(async (admin) => {
      const { admin_id, rawPassword, ...adminData } = admin;
      const password = hashPassword(rawPassword);
      return AdminModel.findOneAndUpdate(
        { admin_id },
        { $set: { ...adminData, password }, $setOnInsert: { admin_id } },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );
    })
  );
}


async function generateUniqueCustomerId() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = `CUST-${Date.now().toString().slice(-5)}${Math.floor(1000 + Math.random() * 9000)}`;
    const existing = await CustomerModel.findOne({ user_id: candidate }).select('_id').lean();
    if (!existing) return candidate;
  }

  const fallback = `CUST-${randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase()}`;
  const existingFallback = await CustomerModel.findOne({ user_id: fallback }).select('_id').lean();
  if (existingFallback) return generateUniqueCustomerId();
  return fallback;
}

export async function startServer(app: express.Express, shouldListen = true) {
  const PORT = Number(process.env.PORT || 5000);
  const frontendOrigins = [
    process.env.APP_URL,
    process.env.VITE_API_URL,
    'https://relish-mart-erp.vercel.app',
    'https://relish-mart-erp.onrender.com'
  ].filter(Boolean) as string[];
  let lastDbError: string | null = null;

  try {
    const connection = await connectToDatabase();
    console.log(`Connected to MongoDB at ${connection.host}`);
    lastDbError = null;
    await seedDatabase();
    console.log('Database collections initialized and seeded.');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    lastDbError = (err as any)?.message || String(err);
  }

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (frontendOrigins.includes(origin) || /^https:\/\/.*\.vercel\.app$/.test(origin) || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true
  }));
  app.use(express.json({ limit: '10mb' }));

  async function triggerEmail(
    recipient: string,
    subject: string,
    body: string,
    type: EmailLog['type']
  ) {
    const log = new EmailLogModel({
      log_id: `EML-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      recipient,
      subject,
      body,
      type,
      sent_at: new Date().toISOString(),
      status: 'Sent'
    });
    await log.save();
    return log;
  }

  app.get('/api/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const payload: any = { status: 'ok', dbStatus, time: new Date().toISOString() };
    if (lastDbError) payload.dbError = lastDbError;
    res.json(payload);
  });

  app.post('/api/admin/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      const normalizedEmail = String(email).trim().toLowerCase();
      const rawPassword = String(password);

      // Check if Admin
      const admin = await AdminModel.findOne({ email: normalizedEmail });
      if (admin) {
        const match = verifyPassword(rawPassword, admin.password);
        if (!match) return res.status(401).json({ error: 'Invalid email or password' });
        const { password: _, ...adminResponse } = admin.toObject();
        return res.json({ ...adminResponse, user_type: 'admin' });
      }

      // Check if Employee
      const employee = await EmployeeModel.findOne({ email: normalizedEmail });
      if (employee) {
        const match = verifyPassword(rawPassword, employee.password);
        if (!match) return res.status(401).json({ error: 'Invalid email or password' });
        const { password: _, ...employeeResponse } = employee.toObject();
        return res.json({ ...employeeResponse, user_type: 'employee' });
      }

      return res.status(401).json({ error: 'Invalid email or password' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Employee CRUD endpoints
  app.get('/api/employees', async (req, res) => {
    try {
      const { admin_id } = req.query;
      const filter: any = {};
      if (admin_id && admin_id !== 'all') {
        filter.admin_id = admin_id;
      }
      const employees = await EmployeeModel.find(filter).select('-password').sort({ createdAt: -1 });
      res.json(employees);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/employees', async (req, res) => {
    try {
      const { admin_id, name, email, password, role, phone } = req.body;
      if (!admin_id || !name || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields (admin_id, name, email, password)' });
      }

      const normalizedEmail = String(email).trim().toLowerCase();
      const existing = await EmployeeModel.findOne({ email: normalizedEmail });
      if (existing) {
        return res.status(400).json({ error: 'An employee with this email already exists' });
      }

      const hashedPassword = hashPassword(String(password).trim());
      const employee = new EmployeeModel({
        employee_id: `EMP-${Date.now().toString().slice(-8)}`,
        admin_id,
        name: String(name).trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: role || 'order_manager',
        phone: String(phone || '').trim()
      });

      await employee.save();
      const { password: _, ...response } = employee.toObject();
      res.status(201).json(response);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/employees/:id', async (req, res) => {
    try {
      const updateData: any = { ...req.body };
      if (updateData.email) {
        updateData.email = String(updateData.email).trim().toLowerCase();
      }
      // If a new plaintext password is provided, hash it before saving
      if (updateData.password && updateData.password.trim()) {
        updateData.password = hashPassword(String(updateData.password).trim());
      } else {
        delete updateData.password; // Don't update password field if empty
      }

      const employee = await EmployeeModel.findOneAndUpdate(
        { employee_id: req.params.id },
        updateData,
        { returnDocument: 'after' }
      ).select('-password');

      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      res.json(employee);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/employees/:id', async (req, res) => {
    try {
      const result = await EmployeeModel.deleteOne({ employee_id: req.params.id });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      res.json({ success: true, message: 'Employee deleted' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/customers/register', async (req, res) => {
    try {
      const { name, email, phone, address, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }
      const normalizedEmail = String(email).trim().toLowerCase();
      const existing = await CustomerModel.findOne({ email: normalizedEmail });
      if (existing) {
        return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
      }
      const generatedUserId = await generateUniqueCustomerId();
      const hashedPassword = hashPassword(String(password).trim());
      const customer = await CustomerModel.findOneAndUpdate(
        { email: normalizedEmail },
        {
          $set: {
            name: String(name).trim(),
            phone: String(phone || '').trim(),
            address: String(address || '').trim(),
            email: normalizedEmail,
            password: hashedPassword
          },
          $setOnInsert: {
            user_id: generatedUserId,
            role: 'customer'
          }
        },
        { upsert: true, returnDocument: 'after' }
      ).select('-password');
      res.json(customer);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Unable to register customer' });
    }
  });

  app.post('/api/customers/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      const normalizedEmail = String(email).trim().toLowerCase();
      const customer = await CustomerModel.findOne({ email: normalizedEmail });
      if (!customer) {
        return res.status(401).json({ error: 'Customer account not found' });
      }
      const match = verifyPassword(String(password), customer.password);
      if (!match) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      const { password: _, ...customerResponse } = customer.toObject();
      res.json(customerResponse);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/admins', async (req, res) => {
    try {
      const admins = await AdminModel.find();
      res.json(admins);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/admins/:admin_id', async (req, res) => {
    try {
      const { admin_id } = req.params;
      const updateData = req.body;
      const admin = await AdminModel.findOneAndUpdate(
        { admin_id },
        updateData,
        { returnDocument: 'after', upsert: true }
      );
      res.json(admin);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/products', async (req, res) => {
    try {
      const { admin_owner, category, search } = req.query;
      const filter: any = {};

      if (admin_owner && admin_owner !== 'all') {
        filter.admin_owner = admin_owner;
      }
      if (category && category !== 'All') {
        filter.category = new RegExp(`^${category}$`, 'i');
      }
      if (search) {
        const q = String(search);
        filter.$or = [
          { product_name: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } }
        ];
      }

      const products = await ProductModel.find(filter).sort({ createdAt: -1 });
      res.json(products);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await ProductModel.findOne({ product_id: req.params.id });
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/products', async (req, res) => {
    try {
      const pData = req.body;
      if (!pData.product_name || !pData.price || !pData.admin_owner) {
        return res.status(400).json({ error: 'Missing required product fields' });
      }

      const newProduct = new ProductModel({
        product_id: `PROD-${Date.now().toString().slice(-4)}`,
        product_name: pData.product_name,
        category: pData.category || 'General',
        image: pData.image || '',
        price: Number(pData.price),
        original_price: Number(pData.original_price || pData.price),
        discount: Number(pData.discount || 0),
        stock: Number(pData.stock || 0),
        admin_owner: pData.admin_owner as AdminId,
        description: pData.description || '',
        rating: 0,
        reviews_count: 0,
        featured: Boolean(pData.featured),
        specifications: pData.specifications || {}
      });

      await newProduct.save();
      res.status(201).json(newProduct);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/products/:id', async (req, res) => {
    try {
      const updateData = { ...req.body };
      if (updateData.price !== undefined) updateData.price = Number(updateData.price);
      if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);

      const product = await ProductModel.findOneAndUpdate(
        { product_id: req.params.id },
        updateData,
        { returnDocument: 'after' }
      );
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/products/:id', async (req, res) => {
    try {
      const result = await ProductModel.deleteOne({ product_id: req.params.id });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json({ success: true, message: 'Product deleted' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/products/seed-sample', async (req, res) => {
    const products = await ProductModel.find();
    res.json({ success: true, count: products.length, products });
  });

  app.post('/api/products/clear-all', async (req, res) => {
    await ProductModel.deleteMany({});
    res.json({ success: true, count: 0, products: [] });
  });

  app.get('/api/orders', async (req, res) => {
    try {
      const { admin_id, customer_email } = req.query;
      const filter: any = {};

      if (admin_id && admin_id !== 'all') {
        filter.admin_id = admin_id;
      }
      if (customer_email) {
        filter.customer_email = new RegExp(`^${customer_email}$`, 'i');
      }

      const orders = await OrderModel.find(filter).sort({ createdAt: -1 });
      res.json(orders);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/orders', async (req, res) => {
    try {
      const {
        customer_id,
        customer_name,
        customer_email,
        customer_phone,
        shipping_address,
        items,
        payment_method
      } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Cart items cannot be empty' });
      }
      if (!customer_name || !customer_email || !customer_phone || !shipping_address) {
        return res.status(400).json({ error: 'Customer name, email, phone, and shipping address are required' });
      }

      const masterOrderId = `MST-${Date.now().toString().slice(-5)}`;
      const createdOrders: any[] = [];
      const createdBills: any[] = [];

      const itemsByAdmin: Record<string, any[]> = {};
      for (const item of items) {
        const owner = item.admin_owner || 'admin1';
        if (!itemsByAdmin[owner]) itemsByAdmin[owner] = [];
        itemsByAdmin[owner].push(item);
      }

      for (const it of items) {
        await ProductModel.updateOne(
          { product_id: it.product_id },
          { $inc: { stock: -it.quantity } }
        );
      }

      let orderIndex = 0;
      for (const [adminId, adminItems] of Object.entries(itemsByAdmin)) {
        const adminDoc = await AdminModel.findOne({ admin_id: adminId });
        const adminEmail = adminDoc?.email || `${adminId}@rilastore.com`;

        const subtotal = adminItems.reduce((acc: number, it: any) => acc + it.price * it.quantity, 0);
        const gst_amount = Number((subtotal * 0.05).toFixed(2));
        const total_amount = Number((subtotal + gst_amount).toFixed(2));

        const suffix = `${Date.now().toString().slice(-4)}${orderIndex}`;
        const subOrderId = `ORD-${suffix}`;
        const trackingNo = `TRK-${Math.floor(100000 + Math.random() * 900000)}`;
        orderIndex++;

        const resolvedCustomerId = customer_id?.trim() || (await generateUniqueCustomerId());
        const customerUser = await CustomerModel.findOneAndUpdate(
          { email: customer_email.trim().toLowerCase() },
          {
            $set: {
              name: customer_name,
              phone: customer_phone,
              address: shipping_address,
              email: customer_email.trim().toLowerCase(),
              role: 'customer'
            },
            $setOnInsert: {
              user_id: resolvedCustomerId
            }
          },
          { upsert: true, returnDocument: 'after' }
        );

        const isCashOnDelivery = String(payment_method).trim() === 'Cash on Delivery';
        const newOrder = new OrderModel({
          order_id: subOrderId,
          master_order_id: masterOrderId,
          customer_id: customerUser?.user_id || resolvedCustomerId,
          customer_name,
          customer_email,
          customer_phone,
          shipping_address,
          items: adminItems,
          subtotal,
          gst_amount,
          discount_amount: 0,
          total_amount,
          admin_id: adminId,
          status: 'Pending',
          payment_method: payment_method || 'UPI',
          payment_status: isCashOnDelivery ? 'Pending' : 'Paid',
          created_at: new Date().toISOString(),
          tracking_number: trackingNo,
          timeline: [
            {
              status: 'Pending',
              timestamp: new Date().toLocaleString(),
              note: isCashOnDelivery
                ? 'Order placed. Payment will be collected on delivery.'
                : 'Order placed & payment verified'
            }
          ]
        });

        await newOrder.save();
        createdOrders.push(newOrder);

        const bill = new BillModel({
          bill_id: `BILL-${suffix}`,
          invoice_number: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          bill_type: 'Online',
          master_order_id: masterOrderId,
          order_id: subOrderId,
          customer_id: newOrder.customer_id,
          customer_name: newOrder.customer_name,
          customer_phone: newOrder.customer_phone,
          customer_email: newOrder.customer_email,
          shipping_address: newOrder.shipping_address,
          products: adminItems.map((i: any) => ({
            product_id: i.product_id,
            product_name: i.product_name,
            quantity: i.quantity,
            price: i.price,
            discount: 0,
            total: i.price * i.quantity
          })),
          items: adminItems.map((i: any) => ({
            product_id: i.product_id,
            product_name: i.product_name,
            quantity: i.quantity,
            price: i.price,
            discount: 0,
            total: i.price * i.quantity
          })),
          subtotal,
          tax_gst: gst_amount,
          discount_total: 0,
          grand_total: total_amount,
          payment_method: newOrder.payment_method,
          payment_status: isCashOnDelivery ? 'Pending' : 'Paid',
          admin_id: adminId,
          created_at: new Date().toISOString(),
          notes: isCashOnDelivery ? `COD Checkout Order #${subOrderId}` : `Online Checkout Order #${subOrderId}`
        });

        await bill.save();
        createdBills.push(bill);

        triggerEmail(
          adminEmail,
          `🚨 New Order Alert #${subOrderId}`,
          `You have received order #${subOrderId} from ${newOrder.customer_name} for ₹${total_amount.toFixed(2)}. Log into ERP to process and pack this shipment.`,
          'Admin Order Alert'
        ).catch(console.error);
      }

      triggerEmail(
        customer_email,
        `Order Confirmation #${masterOrderId} - RILA`,
        `Thank you for your order #${masterOrderId}! Your items will be processed shortly. Track progress directly in your customer dashboard.`,
        'Order Confirmation'
      ).catch(console.error);

      res.status(201).json({
        success: true,
        master_order_id: masterOrderId,
        orders: createdOrders,
        bills: createdBills
      });
    } catch (err: any) {
      console.error('Order creation error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/orders/:id/status', async (req, res) => {
    try {
      const { status, note } = req.body;
      const validStatuses: OrderStatus[] = [
        'Pending',
        'Confirmed',
        'Packed',
        'Shipped',
        'Delivered',
        'Cancelled'
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid order status' });
      }

      const order = await OrderModel.findOne({ order_id: req.params.id });
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      order.status = status as OrderStatus;
      order.timeline.push({
        status: status as OrderStatus,
        timestamp: new Date().toLocaleString(),
        note: note || `Order status updated to ${status}`
      });

      await order.save();

      const emailSubject = status === 'Shipped' ? 'Shipping Update' : status === 'Delivered' ? 'Delivery Confirmation' : 'Order Status Update';
      await triggerEmail(
        order.customer_email,
        `${emailSubject} for Order #${order.order_id}`,
        `Your order #${order.order_id} status has been updated to "${status}". Tracking Number: ${order.tracking_number}.`,
        status === 'Shipped' ? 'Shipping Update' : status === 'Delivered' ? 'Delivery Confirmation' : 'Order Confirmation'
      );

      res.json(order);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/bills', async (req, res) => {
    try {
      const { admin_id } = req.query;
      const filter: any = {};
      if (admin_id && admin_id !== 'all') {
        filter.admin_id = admin_id;
      }
      const bills = await BillModel.find(filter).sort({ createdAt: -1 });
      res.json(bills);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/bills/manual', async (req, res) => {
    try {
      const {
        customer_name,
        customer_phone,
        customer_email,
        products,
        payment_method,
        discount_flat,
        notes
      } = req.body;

      if (!products || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ error: 'Products are required' });
      }
      if (!customer_name || !customer_phone) {
        return res.status(400).json({ error: 'Customer name and phone are required' });
      }

      const adminDoc = await AdminModel.findOne();
      const admin_id = adminDoc?.admin_id || 'admin1';
      const adminBusinessName = adminDoc?.business_name || 'RILA';

      const subtotal = products.reduce((acc: number, item: any) => {
        const lineTotal = (Number(item.price) - Number(item.discount || 0)) * Number(item.quantity);
        return acc + lineTotal;
      }, 0);

      const flatDisc = Number(discount_flat || 0);
      const discountedSubtotal = Math.max(0, subtotal - flatDisc);
      const tax_gst = Number((discountedSubtotal * 0.18).toFixed(2));
      const grand_total = Number((discountedSubtotal + tax_gst).toFixed(2));

      const invoiceNo = `POS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      for (const it of products) {
        await ProductModel.updateOne(
          { product_id: it.product_id },
          { $inc: { stock: -Number(it.quantity) } }
        );
      }

      const billProducts = products.map((p: any) => ({
        product_id: p.product_id,
        product_name: p.product_name,
        quantity: Number(p.quantity),
        price: Number(p.price),
        discount: Number(p.discount || 0),
        total: (Number(p.price) - Number(p.discount || 0)) * Number(p.quantity)
      }));

      const newBill = new BillModel({
        bill_id: `BILL-${Date.now().toString().slice(-5)}`,
        invoice_number: invoiceNo,
        bill_type: 'Manual',
        customer_name,
        customer_phone,
        customer_email: customer_email || '',
        products: billProducts,
        items: billProducts,
        subtotal,
        tax_gst,
        discount_total: flatDisc,
        grand_total,
        payment_method: payment_method || 'Cash',
        payment_status: 'Paid',
        admin_id: admin_id,
        created_at: new Date().toISOString(),
        notes: notes || 'Vyapar Retail Counter POS Bill'
      });

      await newBill.save();

      if (customer_email) {
        await triggerEmail(
          customer_email,
          `Tax Invoice #${invoiceNo} - ${adminBusinessName}`,
          `Thank you for shopping with us! Attached is your GST Tax Invoice #${invoiceNo}.`,
          'Invoice'
        );
      }

      res.status(201).json(newBill);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/expenses', async (req, res) => {
    try {
      const { admin_id, category } = req.query;
      const filter: any = {};

      if (admin_id && admin_id !== 'all') {
        filter.admin_id = admin_id;
      }
      if (category && category !== 'All') {
        filter.category = category;
      }

      const expenses = await ExpenseModel.find(filter).sort({ createdAt: -1 });
      res.json(expenses);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/expenses', async (req, res) => {
    try {
      const {
        admin_id,
        category,
        amount,
        date,
        description,
        receipt_ref,
        vendor,
        invoice_number,
        purchase_order_number,
        gst,
        discount,
        payment_method,
        payment_status,
        notes
      } = req.body;

      if (!admin_id || !amount || !category) {
        return res.status(400).json({ error: 'Missing admin_id, category, or amount' });
      }

      const newExpense = new ExpenseModel({
        expense_id: `EXP-${Date.now().toString().slice(-4)}`,
        admin_id: admin_id as AdminId,
        category,
        amount: Number(amount),
        date: date || new Date().toISOString().split('T')[0],
        description: description || 'Business operational expense',
        receipt_ref: receipt_ref || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
        vendor: vendor || '',
        invoice_number: invoice_number || '',
        purchase_order_number: purchase_order_number || '',
        gst: Number(gst || 0),
        discount: Number(discount || 0),
        payment_method: payment_method || 'Cash',
        payment_status: payment_status || 'Paid',
        notes: notes || ''
      });

      await newExpense.save();
      res.status(201).json(newExpense);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/expenses/:id', async (req, res) => {
    try {
      const updateData = { ...req.body };
      if (updateData.amount !== undefined) updateData.amount = Number(updateData.amount);

      const expense = await ExpenseModel.findOneAndUpdate(
        { expense_id: req.params.id },
        updateData,
        { returnDocument: 'after' }
      );
      if (!expense) {
        return res.status(404).json({ error: 'Expense record not found' });
      }
      res.json(expense);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/expenses/:id', async (req, res) => {
    try {
      await ExpenseModel.deleteOne({ expense_id: req.params.id });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/suppliers', async (req, res) => {
    try {
      const { admin_id } = req.query;
      const filter: any = {};
      if (admin_id && admin_id !== 'all') {
        filter.admin_id = admin_id;
      }
      const suppliers = await SupplierModel.find(filter).sort({ createdAt: -1 });
      res.json(suppliers);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/suppliers', async (req, res) => {
    try {
      const {
        admin_id,
        supplier_name,
        contact_person,
        phone,
        email,
        address,
        categories_supplied,
        company_name,
        gst_number,
        products_supplied,
        outstanding_balance,
        purchase_history
      } = req.body;
      if (!admin_id || !supplier_name || !contact_person || !phone) {
        return res.status(400).json({ error: 'Missing required supplier fields' });
      }

      const newSupplier = new SupplierModel({
        supplier_id: `SUP-${Date.now().toString().slice(-4)}`,
        admin_id: admin_id as AdminId,
        supplier_name,
        contact_person,
        phone,
        email: email || '',
        address: address || '',
        company_name: company_name || supplier_name,
        gst_number: gst_number || '',
        products_supplied: Array.isArray(products_supplied) ? products_supplied : [products_supplied || 'General'],
        outstanding_balance: Number(outstanding_balance || 0),
        purchase_history: purchase_history || '',
        categories_supplied: Array.isArray(categories_supplied) ? categories_supplied : [categories_supplied || 'General']
      });

      await newSupplier.save();
      res.status(201).json(newSupplier);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/suppliers/:id', async (req, res) => {
    try {
      await SupplierModel.deleteOne({ supplier_id: req.params.id });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/feedback', async (req, res) => {
    try {
      const { product_id } = req.query;
      const filter: any = {};
      if (product_id) filter.product_id = product_id;

      const feedback = await FeedbackModel.find(filter).sort({ createdAt: -1 });
      res.json(feedback);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/feedback', async (req, res) => {
    try {
      const { customer_name, customer_email, rating, type, message, product_id, product_name, title, verified_purchase } = req.body;
      if (!customer_name || !customer_email || !message) {
        return res.status(400).json({ error: 'Customer name, email, and message are required' });
      }

      const newFbd = new FeedbackModel({
        feedback_id: `FBD-${Date.now().toString().slice(-4)}`,
        customer_name,
        customer_email,
        rating: Number(rating || 5),
        type: type || 'Review',
        message,
        product_id,
        product_name,
        title: title || 'Customer Review',
        verified_purchase: verified_purchase !== undefined ? verified_purchase : true,
        helpful_count: 0,
        status: 'Published',
        created_at: new Date().toISOString()
      });

      await newFbd.save();

      if (product_id) {
        const prodReviews = await FeedbackModel.find({ product_id });
        const totalRating = prodReviews.reduce((acc, curr) => acc + curr.rating, 0);
        await ProductModel.updateOne(
          { product_id },
          {
            reviews_count: prodReviews.length,
            rating: Number((totalRating / prodReviews.length).toFixed(1))
          }
        );
      }

      res.status(201).json(newFbd);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/feedback/:id/helpful', async (req, res) => {
    try {
      const fbd = await FeedbackModel.findOneAndUpdate(
        { feedback_id: req.params.id },
        { $inc: { helpful_count: 1 } },
        { returnDocument: 'after' }
      );
      if (!fbd) {
        return res.status(404).json({ error: 'Feedback not found' });
      }
      res.json(fbd);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/feedback/:id/reply', async (req, res) => {
    try {
      const fbd = await FeedbackModel.findOneAndUpdate(
        { feedback_id: req.params.id },
        { admin_reply: req.body.reply },
        { returnDocument: 'after' }
      );
      if (!fbd) {
        return res.status(404).json({ error: 'Feedback not found' });
      }
      res.json(fbd);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/customers', async (req, res) => {
    try {
      const { email } = req.query;
      const filter: any = {};
      if (email) {
        filter.email = new RegExp(`^${String(email).trim()}$`, 'i');
      }
      const customers = await CustomerModel.find(filter).sort({ createdAt: -1 });
      res.json(customers);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/email-logs', async (req, res) => {
    try {
      const logs = await EmailLogModel.find().sort({ createdAt: -1 });
      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/reports/pnl', async (req, res) => {
    try {
      const admin_id = (req.query.admin_id as AdminId) || 'admin1';

      const adminOrders = await OrderModel.find({ admin_id, status: { $ne: 'Cancelled' } });
      const adminBills = await BillModel.find({ admin_id });
      const adminExpenses = await ExpenseModel.find({ admin_id });
      const allProducts = await ProductModel.find();

      const sales_revenue = adminOrders.reduce((acc, o) => acc + o.total_amount, 0) +
        adminBills.filter(b => b.bill_type === 'Manual').reduce((acc, b) => acc + b.grand_total, 0);

      const purchaseCost = adminExpenses
        .filter((expense) => expense.category === 'Product Purchase')
        .reduce((acc, expense) => acc + expense.amount, 0);
      const total_expenses = adminExpenses.reduce((acc, e) => acc + e.amount, 0);
      const financeMetrics = calculateFinanceMetrics({
        revenue: sales_revenue,
        purchaseCost,
        expenses: total_expenses,
        taxCollected: adminBills.reduce((acc, bill) => acc + Number(bill.tax_gst || 0), 0),
        discountGiven: adminBills.reduce((acc, bill) => acc + Number(bill.discount_total || 0), 0),
        shippingCharges: 0,
        refundAmount: 0
      });
      const net_profit = financeMetrics.netProfit;

      const dailyMap: Record<string, { sales: number; expenses: number }> = {};

      adminOrders.forEach((o) => {
        const dateKey = new Date(o.created_at).toISOString().split('T')[0];
        if (!dailyMap[dateKey]) dailyMap[dateKey] = { sales: 0, expenses: 0 };
        dailyMap[dateKey].sales += o.total_amount;
      });

      adminBills.filter(b => b.bill_type === 'Manual').forEach((b) => {
        const dateKey = new Date(b.created_at).toISOString().split('T')[0];
        if (!dailyMap[dateKey]) dailyMap[dateKey] = { sales: 0, expenses: 0 };
        dailyMap[dateKey].sales += b.grand_total;
      });

      adminExpenses.forEach((e) => {
        const dateKey = e.date || new Date().toISOString().split('T')[0];
        if (!dailyMap[dateKey]) dailyMap[dateKey] = { sales: 0, expenses: 0 };
        dailyMap[dateKey].expenses += e.amount;
      });

      const daily_sales = Object.keys(dailyMap).sort().map((dateKey) => {
        const sales = Number(dailyMap[dateKey].sales.toFixed(2));
        const expenses = Number(dailyMap[dateKey].expenses.toFixed(2));
        return {
          date: dateKey,
          sales,
          expenses,
          profit: Number((sales - expenses).toFixed(2))
        };
      });

      const categoryMap: Record<string, number> = {};
      adminOrders.forEach((o) => {
        o.items.forEach((it) => {
          const prod = allProducts.find((p) => p.product_id === it.product_id);
          const cat = prod ? prod.category : 'General';
          categoryMap[cat] = (categoryMap[cat] || 0) + it.price * it.quantity;
        });
      });

      const category_sales = Object.keys(categoryMap).map((cat) => ({
        category: cat,
        amount: Number(categoryMap[cat].toFixed(2))
      }));

      const expMap: Record<string, number> = {};
      adminExpenses.forEach((e) => {
        expMap[e.category] = (expMap[e.category] || 0) + e.amount;
      });

      const expense_breakdown = Object.keys(expMap).map((cat) => ({
        category: cat as any,
        amount: Number(expMap[cat].toFixed(2))
      }));

      res.json({
        admin_id,
        period: 'All Time',
        sales_revenue: Number(sales_revenue.toFixed(2)),
        expenses: Number(total_expenses.toFixed(2)),
        net_profit,
        total_orders: adminOrders.length + adminBills.filter(b => b.bill_type === 'Manual').length,
        daily_sales,
        category_sales,
        expense_breakdown,
        finance_metrics: financeMetrics
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Global error-handling middleware — must be added BEFORE static files / Vite middleware
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    console.error(`[ERROR] ${status} — ${message}`, err.stack || '');
    res.status(status).json({ error: message });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (shouldListen) {
    const listenOnPort = (port: number) => {
      const server = app.listen(port, '0.0.0.0', () => {
        process.env.PORT = String(port);
        console.log(`Made Pure & Natural Foods Server listening on http://localhost:${port}`);
      });

      server.on('error', (error: NodeJS.ErrnoException) => {
        if (error.code === 'EADDRINUSE' && port < 65535) {
          console.warn(`Port ${port} is busy, trying ${port + 1}...`);
          server.close();
          listenOnPort(port + 1);
          return;
        }
        console.error('Server listen failed:', error);
        process.exit(1);
      });
    };

    listenOnPort(PORT);
  }
}

let initializedApp: express.Express | null = null;
let appInitPromise: Promise<express.Express> | null = null;

async function initApp() {
  if (initializedApp) return initializedApp;
  if (!appInitPromise) {
    const app = express();
    appInitPromise = startServer(app, false).then(() => {
      initializedApp = app;
      return app;
    });
  }
  return appInitPromise;
}

export default async function handler(req: express.Request, res: express.Response) {
  try {
    const app = await initApp();
    // forward the request to the Express app
    return app(req, res);
  } catch (err: any) {
    const message = err?.message || String(err) || 'unknown_error';
    const payload = { error: 'server_initialization_failed', message };
    try {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(payload));
      return;
    } catch (e) {
      // if response writing also fails, throw to let platform log it
      throw err;
    }
  }
}

