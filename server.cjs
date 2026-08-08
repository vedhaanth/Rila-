var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// backend/run-server.ts
var import_express2 = __toESM(require("express"), 1);

// backend/server.ts
var import_config = require("dotenv/config");
var import_crypto = require("crypto");
var import_express = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_path = __toESM(require("path"), 1);
var import_mongoose11 = __toESM(require("mongoose"), 1);
var import_vite = require("vite");

// src/utils/finance.js
function calculateFinanceMetrics(input) {
  const grossRevenue = Number(input.revenue || 0);
  const totalSales = grossRevenue;
  const totalPurchaseCost = Number(input.purchaseCost || 0);
  const totalExpenses = Number(input.expenses || 0);
  const taxCollected = Number(input.taxCollected || 0);
  const discountGiven = Number(input.discountGiven || 0);
  const shippingCharges = Number(input.shippingCharges || 0);
  const refundAmount = Number(input.refundAmount || 0);
  const netRevenue = Number((totalSales - discountGiven - refundAmount + taxCollected - shippingCharges).toFixed(2));
  const grossProfit = Number((totalSales - totalPurchaseCost).toFixed(2));
  const netProfit = Number((grossProfit - totalExpenses).toFixed(2));
  const loss = netProfit < 0 ? Number((-netProfit).toFixed(2)) : 0;
  return {
    grossRevenue,
    totalSales,
    totalPurchaseCost,
    totalExpenses,
    taxCollected,
    discountGiven,
    shippingCharges,
    refundAmount,
    netRevenue,
    grossProfit,
    netProfit,
    loss
  };
}

// src/db/connect.ts
var dns = __toESM(require("dns"), 1);
var import_mongoose = __toESM(require("mongoose"), 1);
var DNS_FALLBACK_SERVERS = ["8.8.8.8", "1.1.1.1"];
var DOH_ENDPOINT = "https://cloudflare-dns.com/dns-query";
function normalizeHost(host) {
  return host.endsWith(".") ? host.slice(0, -1) : host;
}
function buildFallbackUri(uri, hosts) {
  const parsed = new URL(uri);
  const auth = parsed.username ? `${parsed.username}${parsed.password ? `:${parsed.password}` : ""}@` : "";
  const dbName = parsed.pathname === "/" ? "" : parsed.pathname;
  const params = new URLSearchParams(parsed.search);
  if (!params.has("tls") && !params.has("ssl")) {
    params.set("tls", "true");
  }
  const query = params.toString() ? `?${params.toString()}` : "";
  const hostList = hosts.map((h) => `${h.host}:${h.port}`).join(",");
  return `mongodb://${auth}${hostList}${dbName}${query}`;
}
async function resolveSrvRecords(name) {
  const response = await fetch(`${DOH_ENDPOINT}?name=${encodeURIComponent(name)}&type=SRV`, {
    headers: { Accept: "application/dns-json" }
  });
  if (!response.ok) {
    throw new Error(`DNS-over-HTTPS lookup failed: ${response.statusText}`);
  }
  const payload = await response.json();
  const answers = Array.isArray(payload.Answer) ? payload.Answer : [];
  return answers.map((answer) => {
    const [priority, weight, port, target] = String(answer.data || "").split(" ");
    return target && port ? { host: normalizeHost(target), port: Number(port) } : null;
  }).filter(Boolean);
}
async function connectToDatabase() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not defined. Atlas connection is required.");
  }
  const connectOptions = {
    serverSelectionTimeoutMS: 15e3,
    socketTimeoutMS: 45e3
  };
  try {
    await import_mongoose.default.connect(uri, connectOptions);
    console.log("Connected to Atlas");
    return import_mongoose.default.connection;
  } catch (error) {
    const err = error;
    if (!uri.startsWith("mongodb+srv://")) {
      throw err;
    }
    const srvName = uri.replace(/^mongodb\+srv:\/\//, "").split("/")[0];
    const dnsName = `_mongodb._tcp.${srvName}`;
    try {
      dns.setServers(DNS_FALLBACK_SERVERS);
      await import_mongoose.default.connect(uri, connectOptions);
      console.log("Connected to Atlas using fallback DNS servers");
      return import_mongoose.default.connection;
    } catch (dnsError) {
      console.warn("SRV lookup failed with fallback servers:", dnsError.message);
    }
    try {
      const records = await resolveSrvRecords(dnsName);
      if (!records.length) {
        throw new Error("No SRV records found via DNS-over-HTTPS fallback");
      }
      for (const record of records) {
        const fallbackUri = buildFallbackUri(uri, [record]);
        try {
          await import_mongoose.default.connect(fallbackUri, connectOptions);
          console.log("Connected to Atlas using DNS-over-HTTPS fallback");
          return import_mongoose.default.connection;
        } catch (recordError) {
          console.warn(`Failed to connect to ${record.host}:${record.port} via DNS-over-HTTPS fallback:`, recordError.message);
        }
      }
      throw new Error("Unable to connect to any SRV fallback host");
    } catch (dohError) {
      const combined = `${err.message}; fallback error: ${dohError.message}`;
      throw new Error(combined);
    }
  }
}

// src/models/Product.ts
var import_mongoose2 = __toESM(require("mongoose"), 1);
var ProductSchema = new import_mongoose2.Schema(
  {
    product_id: { type: String, required: true, unique: true },
    product_name: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, default: "" },
    price: { type: Number, required: true },
    original_price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    stock: { type: Number, required: true, default: 0 },
    min_stock_alert: { type: Number },
    admin_owner: { type: String, required: true },
    description: { type: String, default: "" },
    rating: { type: Number, default: 0 },
    reviews_count: { type: Number, default: 0 },
    specifications: { type: import_mongoose2.Schema.Types.Mixed, default: {} },
    featured: { type: Boolean, default: false },
    tags: [{ type: String }]
  },
  { timestamps: true }
);
var Product_default = import_mongoose2.default.model("Product", ProductSchema);

// src/models/Order.ts
var import_mongoose3 = __toESM(require("mongoose"), 1);
var OrderItemSchema = new import_mongoose3.Schema(
  {
    product_id: { type: String, required: true },
    product_name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    admin_owner: { type: String, required: true },
    image: { type: String, default: "" }
  },
  { _id: false }
);
var TimelineSchema = new import_mongoose3.Schema(
  {
    status: { type: String, required: true },
    timestamp: { type: String, required: true },
    note: { type: String, required: true }
  },
  { _id: false }
);
var OrderSchema = new import_mongoose3.Schema(
  {
    order_id: { type: String, required: true, unique: true },
    master_order_id: { type: String, required: true },
    customer_id: { type: String, required: true },
    customer_name: { type: String, required: true },
    customer_email: { type: String, required: true },
    customer_phone: { type: String, required: true },
    shipping_address: { type: String, required: true },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    gst_amount: { type: Number, required: true },
    discount_amount: { type: Number, default: 0 },
    total_amount: { type: Number, required: true },
    admin_id: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"],
      default: "Pending"
    },
    payment_method: { type: String, required: true },
    payment_status: { type: String, required: true, enum: ["Paid", "Pending"], default: "Paid" },
    created_at: { type: String, required: true },
    tracking_number: { type: String, default: "" },
    timeline: [TimelineSchema]
  },
  { timestamps: true }
);
var Order_default = import_mongoose3.default.model("Order", OrderSchema);

// src/models/Bill.ts
var import_mongoose4 = __toESM(require("mongoose"), 1);
var BillProductItemSchema = new import_mongoose4.Schema(
  {
    product_id: { type: String, required: true },
    product_name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    gst_rate: { type: Number },
    total: { type: Number, required: true }
  },
  { _id: false }
);
var BillSchema = new import_mongoose4.Schema(
  {
    bill_id: { type: String, required: true, unique: true },
    invoice_number: { type: String, required: true },
    bill_type: { type: String, enum: ["Online", "Manual"], default: "Manual" },
    master_order_id: { type: String },
    order_id: { type: String },
    customer_id: { type: String },
    customer_name: { type: String, required: true },
    customer_phone: { type: String, required: true },
    customer_email: { type: String, default: "" },
    customer_gstin: { type: String },
    shipping_address: { type: String },
    products: [BillProductItemSchema],
    items: [BillProductItemSchema],
    subtotal: { type: Number, required: true },
    tax_gst: { type: Number, default: 0 },
    cgst: { type: Number },
    sgst: { type: Number },
    discount: { type: Number, default: 0 },
    discount_total: { type: Number, default: 0 },
    grand_total: { type: Number, required: true },
    payment_method: { type: String, default: "Cash" },
    payment_mode: { type: String },
    payment_status: { type: String, enum: ["Paid", "Pending"], default: "Paid" },
    status: { type: String },
    admin_id: { type: String, required: true },
    created_at: { type: String, required: true },
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);
var Bill_default = import_mongoose4.default.model("Bill", BillSchema);

// src/models/Expense.ts
var import_mongoose5 = __toESM(require("mongoose"), 1);
var ExpenseSchema = new import_mongoose5.Schema(
  {
    expense_id: { type: String, required: true, unique: true },
    admin_id: { type: String, required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: String, required: true },
    description: { type: String, required: true },
    receipt_ref: { type: String, default: "" }
  },
  { timestamps: true }
);
var Expense_default = import_mongoose5.default.model("Expense", ExpenseSchema);

// src/models/Supplier.ts
var import_mongoose6 = __toESM(require("mongoose"), 1);
var SupplierSchema = new import_mongoose6.Schema(
  {
    supplier_id: { type: String, required: true, unique: true },
    admin_id: { type: String, required: true },
    supplier_name: { type: String, required: true },
    contact_person: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: "" },
    address: { type: String, default: "" },
    categories_supplied: [{ type: String }]
  },
  { timestamps: true }
);
var Supplier_default = import_mongoose6.default.model("Supplier", SupplierSchema);

// src/models/Feedback.ts
var import_mongoose7 = __toESM(require("mongoose"), 1);
var FeedbackSchema = new import_mongoose7.Schema(
  {
    feedback_id: { type: String, required: true, unique: true },
    customer_name: { type: String, required: true },
    customer_email: { type: String, required: true },
    rating: { type: Number, required: true, default: 5 },
    type: { type: String, enum: ["Review", "Suggestion", "Complaint"], default: "Review" },
    message: { type: String, required: true },
    status: { type: String, enum: ["Pending", "Resolved", "Published"], default: "Published" },
    created_at: { type: String, required: true },
    admin_reply: { type: String },
    product_id: { type: String },
    product_name: { type: String },
    title: { type: String },
    verified_purchase: { type: Boolean, default: true },
    helpful_count: { type: Number, default: 0 }
  },
  { timestamps: true }
);
var Feedback_default = import_mongoose7.default.model("Feedback", FeedbackSchema);

// src/models/EmailLog.ts
var import_mongoose8 = __toESM(require("mongoose"), 1);
var EmailLogSchema = new import_mongoose8.Schema(
  {
    log_id: { type: String, required: true, unique: true },
    recipient: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    type: { type: String, required: true },
    sent_at: { type: String, required: true },
    status: { type: String, enum: ["Sent", "Failed"], default: "Sent" }
  },
  { timestamps: true }
);
var EmailLog_default = import_mongoose8.default.model("EmailLog", EmailLogSchema);

// src/models/Admin.ts
var import_mongoose9 = __toESM(require("mongoose"), 1);
var AdminSchema = new import_mongoose9.Schema(
  {
    admin_id: { type: String, required: true, unique: true },
    admin_name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    business_name: { type: String, required: true },
    phone: { type: String, required: true },
    gstin: { type: String, default: "" },
    address: { type: String, default: "" },
    logo: { type: String, default: "" },
    categories: [{ type: String }]
  },
  { timestamps: true }
);
var AdminModel = import_mongoose9.default.model("Admin", AdminSchema);
var Admin_default = AdminModel;

// src/models/Customer.ts
var import_mongoose10 = __toESM(require("mongoose"), 1);
var CustomerSchema = new import_mongoose10.Schema(
  {
    user_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    saved_addresses: [{ type: String }],
    role: { type: String, default: "customer" }
  },
  { timestamps: true }
);
var CustomerModel = import_mongoose10.default.model("Customer", CustomerSchema);
var Customer_default = CustomerModel;

// src/data/seedData.ts
var ADMIN_PROFILES = {
  admin1: {
    admin_id: "admin1",
    admin_name: "Apex Tech Admin",
    email: "admin1@smartretail.com",
    business_name: "Apex Tech & Electronics",
    phone: "+1 234 567 8900",
    gstin: "27AADCB2230M1Z2",
    address: "123 Tech Park, Silicon Valley, CA",
    categories: ["Electronics", "Gadgets"]
  },
  admin2: {
    admin_id: "admin2",
    admin_name: "Vogue Living Admin",
    email: "admin2@smartretail.com",
    business_name: "Vogue & Living Retail",
    phone: "+1 987 654 3210",
    gstin: "27AADCB2230M1Z3",
    address: "456 Fashion Ave, New York, NY",
    categories: ["Clothing", "Home"]
  }
};

// backend/server.ts
async function seedDatabase() {
  const db = import_mongoose11.default.connection.db;
  if (!db) return;
  const collectionNames = ["products", "orders", "admins", "customers", "bills", "expenses", "suppliers", "feedbacks", "emaillogs"];
  for (const name of collectionNames) {
    try {
      await db.createCollection(name);
    } catch (err) {
      if (!/already exists/i.test(err?.message || "")) {
        console.warn(`Unable to create collection ${name}:`, err?.message || err);
      }
    }
  }
  const adminSeedEntries = Object.values(ADMIN_PROFILES).map((profile) => ({
    ...profile,
    password: "admin123"
  }));
  await Promise.all(
    adminSeedEntries.map((admin) => {
      const { admin_id, ...adminData } = admin;
      return Admin_default.findOneAndUpdate(
        { admin_id },
        { $set: adminData, $setOnInsert: { admin_id } },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
      );
    })
  );
}
async function removeAdmin1SampleData() {
  await Product_default.deleteMany({ admin_owner: "admin1" });
  await Order_default.deleteMany({ admin_id: "admin1" });
  await Bill_default.deleteMany({ admin_id: "admin1" });
}
async function generateUniqueCustomerId() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = `CUST-${Date.now().toString().slice(-5)}${Math.floor(1e3 + Math.random() * 9e3)}`;
    const existing = await Customer_default.findOne({ user_id: candidate }).select("_id").lean();
    if (!existing) return candidate;
  }
  const fallback = `CUST-${(0, import_crypto.randomUUID)().replace(/-/g, "").slice(0, 10).toUpperCase()}`;
  const existingFallback = await Customer_default.findOne({ user_id: fallback }).select("_id").lean();
  if (existingFallback) return generateUniqueCustomerId();
  return fallback;
}
async function startServer(app, shouldListen = true) {
  const PORT = Number(process.env.PORT || 5e3);
  const frontendOrigins = [
    process.env.APP_URL,
    process.env.VITE_API_URL,
    "https://relish-mart-erp.vercel.app",
    "https://relish-mart-erp.onrender.com"
  ].filter(Boolean);
  let lastDbError = null;
  try {
    const connection = await connectToDatabase();
    console.log(`Connected to MongoDB at ${connection.host}`);
    lastDbError = null;
    await seedDatabase();
    if (process.env.NODE_ENV !== "production") {
      await removeAdmin1SampleData();
    }
    console.log("Database collections initialized and seeded.");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    lastDbError = err?.message || String(err);
  }
  app.use((0, import_cors.default)({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (frontendOrigins.includes(origin) || /^https:\/\/.*\.vercel\.app$/.test(origin) || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true
  }));
  app.use(import_express.default.json({ limit: "10mb" }));
  async function triggerEmail(recipient, subject, body, type) {
    const log = new EmailLog_default({
      log_id: `EML-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
      recipient,
      subject,
      body,
      type,
      sent_at: (/* @__PURE__ */ new Date()).toISOString(),
      status: "Sent"
    });
    await log.save();
    return log;
  }
  app.get("/api/health", (req, res) => {
    const dbStatus = import_mongoose11.default.connection.readyState === 1 ? "connected" : "disconnected";
    const payload = { status: "ok", dbStatus, time: (/* @__PURE__ */ new Date()).toISOString() };
    if (lastDbError) payload.dbError = lastDbError;
    res.json(payload);
  });
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const admin = await Admin_default.findOne({ email, password });
      if (!admin) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      res.json(admin);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/customers/register", async (req, res) => {
    try {
      const { name, email, phone, address, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email, and password are required" });
      }
      const normalizedEmail = String(email).trim().toLowerCase();
      const generatedUserId = await generateUniqueCustomerId();
      const customer = await Customer_default.findOneAndUpdate(
        { email: normalizedEmail },
        {
          $set: {
            name: String(name).trim(),
            phone: String(phone || "").trim(),
            address: String(address || "").trim(),
            email: normalizedEmail,
            password: String(password).trim()
          },
          $setOnInsert: {
            user_id: generatedUserId,
            role: "customer"
          }
        },
        { upsert: true, returnDocument: "after" }
      ).select("-password");
      res.json(customer);
    } catch (err) {
      res.status(500).json({ error: err.message || "Unable to register customer" });
    }
  });
  app.post("/api/customers/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      const normalizedEmail = String(email).trim().toLowerCase();
      const customer = await Customer_default.findOne({ email: normalizedEmail });
      if (!customer) {
        return res.status(401).json({ error: "Customer account not found" });
      }
      if (customer.password) {
        if (!password || password !== customer.password) {
          return res.status(401).json({ error: "Invalid email or password" });
        }
      }
      const { password: _, ...customerResponse } = customer.toObject();
      res.json(customerResponse);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/admins", async (req, res) => {
    try {
      const admins = await Admin_default.find();
      res.json(admins);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.put("/api/admins/:admin_id", async (req, res) => {
    try {
      const { admin_id } = req.params;
      const updateData = req.body;
      const admin = await Admin_default.findOneAndUpdate(
        { admin_id },
        updateData,
        { returnDocument: "after", upsert: true }
      );
      res.json(admin);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/products", async (req, res) => {
    try {
      const { admin_owner, category, search } = req.query;
      const filter = {};
      if (admin_owner && admin_owner !== "all") {
        filter.admin_owner = admin_owner;
      }
      if (category && category !== "All") {
        filter.category = new RegExp(`^${category}$`, "i");
      }
      if (search) {
        const q = String(search);
        filter.$or = [
          { product_name: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
          { category: { $regex: q, $options: "i" } }
        ];
      }
      const products = await Product_default.find(filter).sort({ createdAt: -1 });
      res.json(products);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await Product_default.findOne({ product_id: req.params.id });
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/products", async (req, res) => {
    try {
      const pData = req.body;
      if (!pData.product_name || !pData.price || !pData.admin_owner) {
        return res.status(400).json({ error: "Missing required product fields" });
      }
      const newProduct = new Product_default({
        product_id: `PROD-${Date.now().toString().slice(-4)}`,
        product_name: pData.product_name,
        category: pData.category || "General",
        image: pData.image || "",
        price: Number(pData.price),
        original_price: Number(pData.original_price || pData.price),
        discount: Number(pData.discount || 0),
        stock: Number(pData.stock || 0),
        admin_owner: pData.admin_owner,
        description: pData.description || "",
        rating: 0,
        reviews_count: 0,
        featured: Boolean(pData.featured),
        specifications: pData.specifications || {}
      });
      await newProduct.save();
      res.status(201).json(newProduct);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.put("/api/products/:id", async (req, res) => {
    try {
      const updateData = { ...req.body };
      if (updateData.price !== void 0) updateData.price = Number(updateData.price);
      if (updateData.stock !== void 0) updateData.stock = Number(updateData.stock);
      const product = await Product_default.findOneAndUpdate(
        { product_id: req.params.id },
        updateData,
        { returnDocument: "after" }
      );
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/products/:id", async (req, res) => {
    try {
      const result = await Product_default.deleteOne({ product_id: req.params.id });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ success: true, message: "Product deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/products/seed-sample", async (req, res) => {
    const products = await Product_default.find();
    res.json({ success: true, count: products.length, products });
  });
  app.post("/api/products/clear-all", async (req, res) => {
    await Product_default.deleteMany({});
    res.json({ success: true, count: 0, products: [] });
  });
  app.get("/api/orders", async (req, res) => {
    try {
      const { admin_id, customer_email } = req.query;
      const filter = {};
      if (admin_id && admin_id !== "all") {
        filter.admin_id = admin_id;
      }
      if (customer_email) {
        filter.customer_email = new RegExp(`^${customer_email}$`, "i");
      }
      const orders = await Order_default.find(filter).sort({ createdAt: -1 });
      res.json(orders);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/orders", async (req, res) => {
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
        return res.status(400).json({ error: "Cart items cannot be empty" });
      }
      if (!customer_name || !customer_email || !customer_phone || !shipping_address) {
        return res.status(400).json({ error: "Customer name, email, phone, and shipping address are required" });
      }
      const masterOrderId = `MST-${Date.now().toString().slice(-5)}`;
      const createdOrders = [];
      const createdBills = [];
      const itemsByAdmin = {};
      for (const item of items) {
        const owner = item.admin_owner || "admin1";
        if (!itemsByAdmin[owner]) itemsByAdmin[owner] = [];
        itemsByAdmin[owner].push(item);
      }
      for (const it of items) {
        await Product_default.updateOne(
          { product_id: it.product_id },
          { $inc: { stock: -it.quantity } }
        );
      }
      let orderIndex = 0;
      for (const [adminId, adminItems] of Object.entries(itemsByAdmin)) {
        const adminDoc = await Admin_default.findOne({ admin_id: adminId });
        const adminEmail = adminDoc?.email || `${adminId}@rilastore.com`;
        const subtotal = adminItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
        const gst_amount = Number((subtotal * 0.05).toFixed(2));
        const total_amount = Number((subtotal + gst_amount).toFixed(2));
        const suffix = `${Date.now().toString().slice(-4)}${orderIndex}`;
        const subOrderId = `ORD-${suffix}`;
        const trackingNo = `TRK-${Math.floor(1e5 + Math.random() * 9e5)}`;
        orderIndex++;
        const resolvedCustomerId = customer_id?.trim() || await generateUniqueCustomerId();
        const customerUser = await Customer_default.findOneAndUpdate(
          { email: customer_email.trim().toLowerCase() },
          {
            $set: {
              name: customer_name,
              phone: customer_phone,
              address: shipping_address,
              email: customer_email.trim().toLowerCase(),
              role: "customer"
            },
            $setOnInsert: {
              user_id: resolvedCustomerId
            }
          },
          { upsert: true, returnDocument: "after" }
        );
        const isCashOnDelivery = String(payment_method).trim() === "Cash on Delivery";
        const newOrder = new Order_default({
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
          status: "Pending",
          payment_method: payment_method || "UPI",
          payment_status: isCashOnDelivery ? "Pending" : "Paid",
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          tracking_number: trackingNo,
          timeline: [
            {
              status: "Pending",
              timestamp: (/* @__PURE__ */ new Date()).toLocaleString(),
              note: isCashOnDelivery ? "Order placed. Payment will be collected on delivery." : "Order placed & payment verified"
            }
          ]
        });
        await newOrder.save();
        createdOrders.push(newOrder);
        const bill = new Bill_default({
          bill_id: `BILL-${suffix}`,
          invoice_number: `INV-${(/* @__PURE__ */ new Date()).getFullYear()}-${Math.floor(1e3 + Math.random() * 9e3)}`,
          bill_type: "Online",
          master_order_id: masterOrderId,
          order_id: subOrderId,
          customer_id: newOrder.customer_id,
          customer_name: newOrder.customer_name,
          customer_phone: newOrder.customer_phone,
          customer_email: newOrder.customer_email,
          shipping_address: newOrder.shipping_address,
          products: adminItems.map((i) => ({
            product_id: i.product_id,
            product_name: i.product_name,
            quantity: i.quantity,
            price: i.price,
            discount: 0,
            total: i.price * i.quantity
          })),
          items: adminItems.map((i) => ({
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
          payment_status: isCashOnDelivery ? "Pending" : "Paid",
          admin_id: adminId,
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          notes: isCashOnDelivery ? `COD Checkout Order #${subOrderId}` : `Online Checkout Order #${subOrderId}`
        });
        await bill.save();
        createdBills.push(bill);
        triggerEmail(
          adminEmail,
          `\u{1F6A8} New Order Alert #${subOrderId}`,
          `You have received order #${subOrderId} from ${newOrder.customer_name} for \u20B9${total_amount.toFixed(2)}. Log into ERP to process and pack this shipment.`,
          "Admin Order Alert"
        ).catch(console.error);
      }
      triggerEmail(
        customer_email,
        `Order Confirmation #${masterOrderId} - RILA`,
        `Thank you for your order #${masterOrderId}! Your items will be processed shortly. Track progress directly in your customer dashboard.`,
        "Order Confirmation"
      ).catch(console.error);
      res.status(201).json({
        success: true,
        master_order_id: masterOrderId,
        orders: createdOrders,
        bills: createdBills
      });
    } catch (err) {
      console.error("Order creation error:", err);
      res.status(500).json({ error: err.message });
    }
  });
  app.put("/api/orders/:id/status", async (req, res) => {
    try {
      const { status, note } = req.body;
      const validStatuses = [
        "Pending",
        "Confirmed",
        "Packed",
        "Shipped",
        "Delivered",
        "Cancelled"
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid order status" });
      }
      const order = await Order_default.findOne({ order_id: req.params.id });
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      order.status = status;
      order.timeline.push({
        status,
        timestamp: (/* @__PURE__ */ new Date()).toLocaleString(),
        note: note || `Order status updated to ${status}`
      });
      await order.save();
      const emailSubject = status === "Shipped" ? "Shipping Update" : status === "Delivered" ? "Delivery Confirmation" : "Order Status Update";
      await triggerEmail(
        order.customer_email,
        `${emailSubject} for Order #${order.order_id}`,
        `Your order #${order.order_id} status has been updated to "${status}". Tracking Number: ${order.tracking_number}.`,
        status === "Shipped" ? "Shipping Update" : status === "Delivered" ? "Delivery Confirmation" : "Order Confirmation"
      );
      res.json(order);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/bills", async (req, res) => {
    try {
      const { admin_id } = req.query;
      const filter = {};
      if (admin_id && admin_id !== "all") {
        filter.admin_id = admin_id;
      }
      const bills = await Bill_default.find(filter).sort({ createdAt: -1 });
      res.json(bills);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/bills/manual", async (req, res) => {
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
        return res.status(400).json({ error: "Products are required" });
      }
      if (!customer_name || !customer_phone) {
        return res.status(400).json({ error: "Customer name and phone are required" });
      }
      const adminDoc = await Admin_default.findOne();
      const admin_id = adminDoc?.admin_id || "admin1";
      const adminBusinessName = adminDoc?.business_name || "RILA";
      const subtotal = products.reduce((acc, item) => {
        const lineTotal = (Number(item.price) - Number(item.discount || 0)) * Number(item.quantity);
        return acc + lineTotal;
      }, 0);
      const flatDisc = Number(discount_flat || 0);
      const discountedSubtotal = Math.max(0, subtotal - flatDisc);
      const tax_gst = Number((discountedSubtotal * 0.18).toFixed(2));
      const grand_total = Number((discountedSubtotal + tax_gst).toFixed(2));
      const invoiceNo = `POS-${(/* @__PURE__ */ new Date()).getFullYear()}-${Math.floor(1e3 + Math.random() * 9e3)}`;
      for (const it of products) {
        await Product_default.updateOne(
          { product_id: it.product_id },
          { $inc: { stock: -Number(it.quantity) } }
        );
      }
      const billProducts = products.map((p) => ({
        product_id: p.product_id,
        product_name: p.product_name,
        quantity: Number(p.quantity),
        price: Number(p.price),
        discount: Number(p.discount || 0),
        total: (Number(p.price) - Number(p.discount || 0)) * Number(p.quantity)
      }));
      const newBill = new Bill_default({
        bill_id: `BILL-${Date.now().toString().slice(-5)}`,
        invoice_number: invoiceNo,
        bill_type: "Manual",
        customer_name,
        customer_phone,
        customer_email: customer_email || "",
        products: billProducts,
        items: billProducts,
        subtotal,
        tax_gst,
        discount_total: flatDisc,
        grand_total,
        payment_method: payment_method || "Cash",
        payment_status: "Paid",
        admin_id,
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        notes: notes || "Vyapar Retail Counter POS Bill"
      });
      await newBill.save();
      if (customer_email) {
        await triggerEmail(
          customer_email,
          `Tax Invoice #${invoiceNo} - ${adminBusinessName}`,
          `Thank you for shopping with us! Attached is your GST Tax Invoice #${invoiceNo}.`,
          "Invoice"
        );
      }
      res.status(201).json(newBill);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/expenses", async (req, res) => {
    try {
      const { admin_id, category } = req.query;
      const filter = {};
      if (admin_id && admin_id !== "all") {
        filter.admin_id = admin_id;
      }
      if (category && category !== "All") {
        filter.category = category;
      }
      const expenses = await Expense_default.find(filter).sort({ createdAt: -1 });
      res.json(expenses);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/expenses", async (req, res) => {
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
        return res.status(400).json({ error: "Missing admin_id, category, or amount" });
      }
      const newExpense = new Expense_default({
        expense_id: `EXP-${Date.now().toString().slice(-4)}`,
        admin_id,
        category,
        amount: Number(amount),
        date: date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        description: description || "Business operational expense",
        receipt_ref: receipt_ref || `REF-${Math.floor(1e3 + Math.random() * 9e3)}`,
        vendor: vendor || "",
        invoice_number: invoice_number || "",
        purchase_order_number: purchase_order_number || "",
        gst: Number(gst || 0),
        discount: Number(discount || 0),
        payment_method: payment_method || "Cash",
        payment_status: payment_status || "Paid",
        notes: notes || ""
      });
      await newExpense.save();
      res.status(201).json(newExpense);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.put("/api/expenses/:id", async (req, res) => {
    try {
      const updateData = { ...req.body };
      if (updateData.amount !== void 0) updateData.amount = Number(updateData.amount);
      const expense = await Expense_default.findOneAndUpdate(
        { expense_id: req.params.id },
        updateData,
        { returnDocument: "after" }
      );
      if (!expense) {
        return res.status(404).json({ error: "Expense record not found" });
      }
      res.json(expense);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      await Expense_default.deleteOne({ expense_id: req.params.id });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/suppliers", async (req, res) => {
    try {
      const { admin_id } = req.query;
      const filter = {};
      if (admin_id && admin_id !== "all") {
        filter.admin_id = admin_id;
      }
      const suppliers = await Supplier_default.find(filter).sort({ createdAt: -1 });
      res.json(suppliers);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/suppliers", async (req, res) => {
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
        return res.status(400).json({ error: "Missing required supplier fields" });
      }
      const newSupplier = new Supplier_default({
        supplier_id: `SUP-${Date.now().toString().slice(-4)}`,
        admin_id,
        supplier_name,
        contact_person,
        phone,
        email: email || "",
        address: address || "",
        company_name: company_name || supplier_name,
        gst_number: gst_number || "",
        products_supplied: Array.isArray(products_supplied) ? products_supplied : [products_supplied || "General"],
        outstanding_balance: Number(outstanding_balance || 0),
        purchase_history: purchase_history || "",
        categories_supplied: Array.isArray(categories_supplied) ? categories_supplied : [categories_supplied || "General"]
      });
      await newSupplier.save();
      res.status(201).json(newSupplier);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/suppliers/:id", async (req, res) => {
    try {
      await Supplier_default.deleteOne({ supplier_id: req.params.id });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/feedback", async (req, res) => {
    try {
      const { product_id } = req.query;
      const filter = {};
      if (product_id) filter.product_id = product_id;
      const feedback = await Feedback_default.find(filter).sort({ createdAt: -1 });
      res.json(feedback);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/feedback", async (req, res) => {
    try {
      const { customer_name, customer_email, rating, type, message, product_id, product_name, title, verified_purchase } = req.body;
      if (!customer_name || !customer_email || !message) {
        return res.status(400).json({ error: "Customer name, email, and message are required" });
      }
      const newFbd = new Feedback_default({
        feedback_id: `FBD-${Date.now().toString().slice(-4)}`,
        customer_name,
        customer_email,
        rating: Number(rating || 5),
        type: type || "Review",
        message,
        product_id,
        product_name,
        title: title || "Customer Review",
        verified_purchase: verified_purchase !== void 0 ? verified_purchase : true,
        helpful_count: 0,
        status: "Published",
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      await newFbd.save();
      if (product_id) {
        const prodReviews = await Feedback_default.find({ product_id });
        const totalRating = prodReviews.reduce((acc, curr) => acc + curr.rating, 0);
        await Product_default.updateOne(
          { product_id },
          {
            reviews_count: prodReviews.length,
            rating: Number((totalRating / prodReviews.length).toFixed(1))
          }
        );
      }
      res.status(201).json(newFbd);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.put("/api/feedback/:id/helpful", async (req, res) => {
    try {
      const fbd = await Feedback_default.findOneAndUpdate(
        { feedback_id: req.params.id },
        { $inc: { helpful_count: 1 } },
        { returnDocument: "after" }
      );
      if (!fbd) {
        return res.status(404).json({ error: "Feedback not found" });
      }
      res.json(fbd);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.put("/api/feedback/:id/reply", async (req, res) => {
    try {
      const fbd = await Feedback_default.findOneAndUpdate(
        { feedback_id: req.params.id },
        { admin_reply: req.body.reply },
        { returnDocument: "after" }
      );
      if (!fbd) {
        return res.status(404).json({ error: "Feedback not found" });
      }
      res.json(fbd);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/customers", async (req, res) => {
    try {
      const { email } = req.query;
      const filter = {};
      if (email) {
        filter.email = new RegExp(`^${String(email).trim()}$`, "i");
      }
      const customers = await Customer_default.find(filter).sort({ createdAt: -1 });
      res.json(customers);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/email-logs", async (req, res) => {
    try {
      const logs = await EmailLog_default.find().sort({ createdAt: -1 });
      res.json(logs);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/reports/pnl", async (req, res) => {
    try {
      const admin_id = req.query.admin_id || "admin1";
      const adminOrders = await Order_default.find({ admin_id, status: { $ne: "Cancelled" } });
      const adminBills = await Bill_default.find({ admin_id });
      const adminExpenses = await Expense_default.find({ admin_id });
      const allProducts = await Product_default.find();
      const sales_revenue = adminOrders.reduce((acc, o) => acc + o.total_amount, 0) + adminBills.filter((b) => b.bill_type === "Manual").reduce((acc, b) => acc + b.grand_total, 0);
      const purchaseCost = adminExpenses.filter((expense) => expense.category === "Product Purchase").reduce((acc, expense) => acc + expense.amount, 0);
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
      const dailyMap = {};
      adminOrders.forEach((o) => {
        const dateKey = new Date(o.created_at).toISOString().split("T")[0];
        if (!dailyMap[dateKey]) dailyMap[dateKey] = { sales: 0, expenses: 0 };
        dailyMap[dateKey].sales += o.total_amount;
      });
      adminBills.filter((b) => b.bill_type === "Manual").forEach((b) => {
        const dateKey = new Date(b.created_at).toISOString().split("T")[0];
        if (!dailyMap[dateKey]) dailyMap[dateKey] = { sales: 0, expenses: 0 };
        dailyMap[dateKey].sales += b.grand_total;
      });
      adminExpenses.forEach((e) => {
        const dateKey = e.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
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
      const categoryMap = {};
      adminOrders.forEach((o) => {
        o.items.forEach((it) => {
          const prod = allProducts.find((p) => p.product_id === it.product_id);
          const cat = prod ? prod.category : "General";
          categoryMap[cat] = (categoryMap[cat] || 0) + it.price * it.quantity;
        });
      });
      const category_sales = Object.keys(categoryMap).map((cat) => ({
        category: cat,
        amount: Number(categoryMap[cat].toFixed(2))
      }));
      const expMap = {};
      adminExpenses.forEach((e) => {
        expMap[e.category] = (expMap[e.category] || 0) + e.amount;
      });
      const expense_breakdown = Object.keys(expMap).map((cat) => ({
        category: cat,
        amount: Number(expMap[cat].toFixed(2))
      }));
      res.json({
        admin_id,
        period: "All Time",
        sales_revenue: Number(sales_revenue.toFixed(2)),
        expenses: Number(total_expenses.toFixed(2)),
        net_profit,
        total_orders: adminOrders.length + adminBills.filter((b) => b.bill_type === "Manual").length,
        daily_sales,
        category_sales,
        expense_breakdown,
        finance_metrics: financeMetrics
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  if (shouldListen) {
    const listenOnPort = (port) => {
      const server = app.listen(port, "0.0.0.0", () => {
        process.env.PORT = String(port);
        console.log(`Made Pure & Natural Foods Server listening on http://localhost:${port}`);
      });
      server.on("error", (error) => {
        if (error.code === "EADDRINUSE" && port < 65535) {
          console.warn(`Port ${port} is busy, trying ${port + 1}...`);
          server.close();
          listenOnPort(port + 1);
          return;
        }
        console.error("Server listen failed:", error);
        process.exit(1);
      });
    };
    listenOnPort(PORT);
  }
}

// backend/run-server.ts
startServer((0, import_express2.default)()).catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
//# sourceMappingURL=server.cjs.map
