import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return secret;
}

function getJwtExpiresIn() {
  return process.env.JWT_EXPIRES_IN || "7d";
}

function signToken(user) {
  return jwt.sign(
    { sub: user.id, businessId: user.businessId, role: user.role, fullName: user.fullName },
    getJwtSecret(),
    { expiresIn: getJwtExpiresIn() },
  );
}

const signupSchema = z.object({
  businessName: z.string().min(2).max(120),
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(6).max(200),
  pin: z.string().regex(/^\d{4}$/).optional(),
  role: z.enum(["OWNER", "MANAGER", "CASHIER"]).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export function registerAuthRoutes(app) {
  app.post("/api/auth/signup", async (req, res) => {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid payload", issues: parsed.error.issues });

    const { businessName, fullName, email, password, pin, role } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 12);
    const pinHash = pin ? await bcrypt.hash(pin, 12) : null;

    const business = await prisma.business.create({
      data: {
        name: businessName,
        currency: "GHS",
        users: {
          create: {
            fullName,
            email,
            role: role || "OWNER",
            passwordHash,
            pinHash,
          },
        },
      },
      include: { users: true },
    });

    const user = business.users[0];
    const token = signToken(user);

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        businessId: user.businessId,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      business: { id: business.id, name: business.name, currency: business.currency },
    });
  });

  app.post("/api/auth/login", async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid payload", issues: parsed.error.issues });

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken(user);

    return res.json({
      token,
      user: {
        id: user.id,
        businessId: user.businessId,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  });
}

