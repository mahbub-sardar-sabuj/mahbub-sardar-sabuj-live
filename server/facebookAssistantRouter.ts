import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import {
  facebookAssistantAuditLogs,
  facebookAssistantSettings,
  facebookKnowledgeEntries,
  facebookReplyDrafts,
  facebookSafetyRules,
  facebookStyleProfiles,
} from "../drizzle/schema";
import { getDb } from "./db";
import { invokeLLM } from "./_core/llm";
import { adminProcedure, router } from "./_core/trpc";

const channelSchema = z.enum(["comment", "messenger", "manual"]);
const draftStatusSchema = z.enum(["pending", "approved", "rejected", "handoff", "sent", "failed"]);
const knowledgeCategorySchema = z.enum(["business", "service", "price", "faq", "delivery", "contact", "policy", "other"]);
const safetyActionSchema = z.enum(["handoff", "block", "draft_only"]);
const replyLengthSchema = z.enum(["short", "medium", "detailed"]);

const DEFAULT_DISCLOSURE = "এটি একটি স্বয়ংক্রিয় সহায়তা ব্যবস্থা। প্রয়োজন হলে একজন দায়িত্বশীল ব্যক্তি সহায়তা করবেন।";
const DEFAULT_TONE = "উত্তর হবে স্বাভাবিক, বিনয়ী, সংক্ষিপ্ত এবং প্রাঞ্জল বাংলায়। অজানা তথ্য তৈরি করবে না। প্রয়োজন হলে দায়িত্বশীল ব্যক্তির সহায়তার কথা বলবে।";
const HIGH_RISK_TERMS = [
  "refund", "রিফান্ড", "টাকা", "পেমেন্ট", "payment", "বিকাশ", "নগদ", "বিতর্ক", "অভিযোগ",
  "আইন", "legal", "মামলা", "ডাক্তার", "চিকিৎসা", "medical", "আত্মহত্য", "self harm",
  "হুমকি", "threat", "পাসওয়ার্ড", "otp", "কোড", "ব্যক্তিগত তথ্য", "মানুষের সাথে কথা",
  "মানুষের সঙ্গে কথা", "human agent", "ম্যানেজার",
];

type DraftResult = {
  replyText: string;
  confidence: number;
  needsHuman: boolean;
  reason: string;
  safetyFlags: string[];
  generatedBy: string;
};

function textContainsRisk(text: string) {
  const normalized = text.toLowerCase();
  return HIGH_RISK_TERMS.filter((term) => normalized.includes(term));
}

function parseModelJson(content: string): Omit<DraftResult, "generatedBy"> | null {
  try {
    const parsed = JSON.parse(content);
    if (!parsed || typeof parsed !== "object") return null;
    const replyText = typeof parsed.replyText === "string" ? parsed.replyText.trim() : "";
    const confidence = typeof parsed.confidence === "number" ? Math.max(0, Math.min(100, Math.round(parsed.confidence))) : 0;
    const needsHuman = Boolean(parsed.needsHuman);
    const reason = typeof parsed.reason === "string" ? parsed.reason.trim().slice(0, 600) : "";
    const safetyFlags = Array.isArray(parsed.safetyFlags)
      ? parsed.safetyFlags.filter((value: unknown): value is string => typeof value === "string").map((value: string) => value.slice(0, 120)).slice(0, 8)
      : [];
    if (!replyText && !needsHuman) return null;
    return { replyText: replyText.slice(0, 1200), confidence, needsHuman, reason, safetyFlags };
  } catch {
    return null;
  }
}

function fallbackDraft(message: string, needsHuman: boolean, reason: string, flags: string[]): DraftResult {
  const replyText = needsHuman
    ? "আপনার বিষয়টি গুরুত্বের সঙ্গে দেখা হচ্ছে। সঠিক সহায়তার জন্য দায়িত্বশীল একজন ব্যক্তি খুব শিগগিরই উত্তর দেবেন।"
    : "আপনার বার্তার জন্য ধন্যবাদ। বিষয়টি দেখে প্রয়োজনীয় তথ্য নিয়ে আপনাকে জানানো হবে।";
  return { replyText, confidence: needsHuman ? 0 : 35, needsHuman, reason, safetyFlags: flags, generatedBy: "safe_fallback" };
}

async function createAiDraft({
  incomingText,
  channel,
  postContext,
  conversationContext,
  knowledge,
  style,
  safetyFlags,
}: {
  incomingText: string;
  channel: "comment" | "messenger" | "manual";
  postContext?: string | null;
  conversationContext?: string | null;
  knowledge: Array<{ title: string; content: string; category: string }>;
  style: { toneInstructions: string; sampleReplies?: string | null; replyLength: "short" | "medium" | "detailed" } | null;
  safetyFlags: string[];
}): Promise<DraftResult> {
  if (safetyFlags.length > 0) {
    return fallbackDraft(incomingText, true, "সংবেদনশীল বা মানব-সহায়তা প্রয়োজন এমন বিষয় শনাক্ত হয়েছে", safetyFlags);
  }

  const knowledgeText = knowledge.length
    ? knowledge.map((entry, index) => `${index + 1}. [${entry.category}] ${entry.title}: ${entry.content}`).join("\n")
    : "কোনো যাচাইকৃত তথ্য পাওয়া যায়নি।";
  const tone = style?.toneInstructions?.trim() || DEFAULT_TONE;
  const samples = style?.sampleReplies?.trim() || "কোনো উদাহরণ নেই।";

  try {
    const response = await invokeLLM({
      model: "gpt-5-mini",
      maxTokens: 520,
      reasoning: { effort: "minimal" },
      messages: [
        {
          role: "system",
          content: `তুমি একটি Facebook Page-এর admin-only draft assistant। এটি কোনো স্বয়ংক্রিয় পাঠানো নয়; শুধু দায়িত্বশীল admin-এর পর্যালোচনার জন্য draft তৈরি করো।\n\nনিয়ম:\n1. কোনো তথ্য অনুমান বা বানিয়ে বলবে না।\n2. টাকা, পেমেন্ট, রিফান্ড, অভিযোগ, আইন, চিকিৎসা, ব্যক্তিগত তথ্য, হুমকি, হয়রানি অথবা মানুষের সহায়তা চাওয়া হলে needsHuman=true দেবে এবং সরাসরি সমাধান দেবে না।\n3. replyText ১-৩টি বাক্যে হবে; emoji, markdown এবং AI identity label ব্যবহার করবে না।\n4. উত্তরটি ${channel === "comment" ? "public comment" : "Messenger"} context-এর উপযোগী হবে।\n5. যাচাইকৃত knowledge-এর বাইরে কোনো ব্যবসায়িক প্রতিশ্রুতি দেবে না।\n6. ভাষা ও ভঙ্গি: ${tone}\n\nঅনুমোদিত উদাহরণ:\n${samples}\n\nযাচাইকৃত knowledge:\n${knowledgeText}`,
        },
        {
          role: "user",
          content: `Incoming message: ${incomingText}\n\nPost context: ${postContext || "নেই"}\n\nConversation context: ${conversationContext || "নেই"}`,
        },
      ],
      outputSchema: {
        name: "facebook_reply_draft",
        strict: true,
        schema: {
          type: "object",
          properties: {
            replyText: { type: "string" },
            confidence: { type: "integer", minimum: 0, maximum: 100 },
            needsHuman: { type: "boolean" },
            reason: { type: "string" },
            safetyFlags: { type: "array", items: { type: "string" } },
          },
          required: ["replyText", "confidence", "needsHuman", "reason", "safetyFlags"],
          additionalProperties: false,
        },
      },
    });
    const content = response.choices?.[0]?.message?.content;
    const parsed = typeof content === "string" ? parseModelJson(content) : null;
    if (parsed) return { ...parsed, generatedBy: "gpt-5-mini" };
  } catch (error) {
    console.warn("[facebook-assistant] draft model unavailable:", error instanceof Error ? error.message : "unknown");
  }

  return fallbackDraft(incomingText, false, "AI draft service সাময়িকভাবে পাওয়া যায়নি", []);
}

async function audit(
  ownerOpenId: string,
  actorOpenId: string | null,
  action: string,
  entityType: string,
  entityId?: string | number | null,
  details?: Record<string, unknown>,
) {
  const db = await getDb();
  if (!db) return;
  await db.insert(facebookAssistantAuditLogs).values({
    ownerOpenId,
    actorOpenId,
    action,
    entityType,
    entityId: entityId === undefined || entityId === null ? null : String(entityId),
    details: details ? JSON.stringify(details) : null,
  });
}

async function getSettingsForOwner(ownerOpenId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const existing = await db.select().from(facebookAssistantSettings).where(eq(facebookAssistantSettings.ownerOpenId, ownerOpenId)).limit(1);
  if (existing[0]) return existing[0];
  await db.insert(facebookAssistantSettings).values({ ownerOpenId, disclosureText: DEFAULT_DISCLOSURE });
  const created = await db.select().from(facebookAssistantSettings).where(eq(facebookAssistantSettings.ownerOpenId, ownerOpenId)).limit(1);
  if (!created[0]) throw new Error("Unable to create assistant settings");
  return created[0];
}

export const facebookAssistantRouter = router({
  overview: adminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { ready: false, settings: null, counts: { pending: 0, handoff: 0, approved: 0 }, recentDrafts: [] };
    const settings = await getSettingsForOwner(ctx.user.openId);
    const recentDrafts = await db.select().from(facebookReplyDrafts)
      .where(eq(facebookReplyDrafts.ownerOpenId, ctx.user.openId))
      .orderBy(desc(facebookReplyDrafts.createdAt)).limit(12);
    return {
      ready: true,
      settings,
      counts: {
        pending: recentDrafts.filter((item) => item.status === "pending").length,
        handoff: recentDrafts.filter((item) => item.status === "handoff").length,
        approved: recentDrafts.filter((item) => item.status === "approved").length,
      },
      recentDrafts,
    };
  }),

  getSettings: adminProcedure.query(async ({ ctx }) => getSettingsForOwner(ctx.user.openId)),

  saveSettings: adminProcedure.input(z.object({
    commentDraftEnabled: z.boolean(),
    messengerDraftEnabled: z.boolean(),
    humanHandoffEnabled: z.boolean(),
    disclosureText: z.string().trim().min(12).max(600),
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const current = await getSettingsForOwner(ctx.user.openId);
    // Auto Reply intentionally remains off. This requires a later explicit, reviewed release.
    await db.update(facebookAssistantSettings).set({ ...input, autoReplyEnabled: false }).where(eq(facebookAssistantSettings.id, current.id));
    await audit(ctx.user.openId, ctx.user.openId, "settings_updated", "settings", current.id, input);
    return { success: true };
  }),

  listKnowledge: adminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(facebookKnowledgeEntries)
      .where(eq(facebookKnowledgeEntries.ownerOpenId, ctx.user.openId))
      .orderBy(desc(facebookKnowledgeEntries.active), facebookKnowledgeEntries.sortOrder, desc(facebookKnowledgeEntries.updatedAt)).limit(200);
  }),

  saveKnowledge: adminProcedure.input(z.object({
    id: z.number().int().positive().optional(),
    category: knowledgeCategorySchema,
    title: z.string().trim().min(2).max(220),
    content: z.string().trim().min(4).max(12000),
    active: z.boolean().default(true),
    sortOrder: z.number().int().min(0).max(9999).default(0),
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const values = { category: input.category, title: input.title, content: input.content, active: input.active, sortOrder: input.sortOrder };
    if (input.id) {
      await db.update(facebookKnowledgeEntries).set(values).where(and(eq(facebookKnowledgeEntries.id, input.id), eq(facebookKnowledgeEntries.ownerOpenId, ctx.user.openId)));
      await audit(ctx.user.openId, ctx.user.openId, "knowledge_updated", "knowledge", input.id, { title: input.title });
      return { success: true, id: input.id };
    }
    const result = await db.insert(facebookKnowledgeEntries).values({ ownerOpenId: ctx.user.openId, ...values });
    const id = Number(result[0]?.insertId || 0);
    await audit(ctx.user.openId, ctx.user.openId, "knowledge_created", "knowledge", id || null, { title: input.title });
    return { success: true, id };
  }),

  deleteKnowledge: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    await db.delete(facebookKnowledgeEntries).where(and(eq(facebookKnowledgeEntries.id, input.id), eq(facebookKnowledgeEntries.ownerOpenId, ctx.user.openId)));
    await audit(ctx.user.openId, ctx.user.openId, "knowledge_deleted", "knowledge", input.id);
    return { success: true };
  }),

  getStyle: adminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const rows = await db.select().from(facebookStyleProfiles).where(eq(facebookStyleProfiles.ownerOpenId, ctx.user.openId)).limit(1);
    return rows[0] || null;
  }),

  saveStyle: adminProcedure.input(z.object({
    name: z.string().trim().min(2).max(120),
    toneInstructions: z.string().trim().min(12).max(12000),
    sampleReplies: z.string().trim().max(12000).optional(),
    replyLength: replyLengthSchema,
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const existing = await db.select().from(facebookStyleProfiles).where(eq(facebookStyleProfiles.ownerOpenId, ctx.user.openId)).limit(1);
    const values = { name: input.name, toneInstructions: input.toneInstructions, sampleReplies: input.sampleReplies || null, replyLength: input.replyLength, active: true };
    if (existing[0]) await db.update(facebookStyleProfiles).set(values).where(eq(facebookStyleProfiles.id, existing[0].id));
    else await db.insert(facebookStyleProfiles).values({ ownerOpenId: ctx.user.openId, ...values });
    await audit(ctx.user.openId, ctx.user.openId, "style_saved", "style_profile", existing[0]?.id || null, { name: input.name });
    return { success: true };
  }),

  listSafetyRules: adminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(facebookSafetyRules).where(eq(facebookSafetyRules.ownerOpenId, ctx.user.openId)).orderBy(desc(facebookSafetyRules.active), desc(facebookSafetyRules.updatedAt)).limit(200);
  }),

  saveSafetyRule: adminProcedure.input(z.object({
    id: z.number().int().positive().optional(),
    ruleType: z.enum(["keyword", "category"]),
    pattern: z.string().trim().min(2).max(300),
    action: safetyActionSchema,
    note: z.string().trim().max(600).optional(),
    active: z.boolean().default(true),
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const values = { ruleType: input.ruleType, pattern: input.pattern, action: input.action, note: input.note || null, active: input.active };
    if (input.id) {
      await db.update(facebookSafetyRules).set(values).where(and(eq(facebookSafetyRules.id, input.id), eq(facebookSafetyRules.ownerOpenId, ctx.user.openId)));
      await audit(ctx.user.openId, ctx.user.openId, "safety_rule_updated", "safety_rule", input.id, { pattern: input.pattern, action: input.action });
      return { success: true, id: input.id };
    }
    const result = await db.insert(facebookSafetyRules).values({ ownerOpenId: ctx.user.openId, ...values });
    const id = Number(result[0]?.insertId || 0);
    await audit(ctx.user.openId, ctx.user.openId, "safety_rule_created", "safety_rule", id || null, { pattern: input.pattern, action: input.action });
    return { success: true, id };
  }),

  deleteSafetyRule: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    await db.delete(facebookSafetyRules).where(and(eq(facebookSafetyRules.id, input.id), eq(facebookSafetyRules.ownerOpenId, ctx.user.openId)));
    await audit(ctx.user.openId, ctx.user.openId, "safety_rule_deleted", "safety_rule", input.id);
    return { success: true };
  }),

  listDrafts: adminProcedure.input(z.object({ status: draftStatusSchema.or(z.literal("all")).default("pending") }).optional()).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) return [];
    const status = input?.status || "pending";
    const query = db.select().from(facebookReplyDrafts);
    return status === "all"
      ? query.where(eq(facebookReplyDrafts.ownerOpenId, ctx.user.openId)).orderBy(desc(facebookReplyDrafts.createdAt)).limit(120)
      : query.where(and(eq(facebookReplyDrafts.ownerOpenId, ctx.user.openId), eq(facebookReplyDrafts.status, status))).orderBy(desc(facebookReplyDrafts.createdAt)).limit(120);
  }),

  createDraft: adminProcedure.input(z.object({
    channel: channelSchema,
    incomingText: z.string().trim().min(1).max(5000),
    postContext: z.string().trim().max(6000).optional(),
    conversationContext: z.string().trim().max(8000).optional(),
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const activeKnowledge = await db.select({ title: facebookKnowledgeEntries.title, content: facebookKnowledgeEntries.content, category: facebookKnowledgeEntries.category })
      .from(facebookKnowledgeEntries)
      .where(and(eq(facebookKnowledgeEntries.ownerOpenId, ctx.user.openId), eq(facebookKnowledgeEntries.active, true)))
      .orderBy(facebookKnowledgeEntries.sortOrder, desc(facebookKnowledgeEntries.updatedAt)).limit(40);
    const styles = await db.select().from(facebookStyleProfiles).where(eq(facebookStyleProfiles.ownerOpenId, ctx.user.openId)).limit(1);
    const activeRules = await db.select().from(facebookSafetyRules)
      .where(and(eq(facebookSafetyRules.ownerOpenId, ctx.user.openId), eq(facebookSafetyRules.active, true))).limit(120);
    const keywordFlags = textContainsRisk(input.incomingText);
    const configuredFlags = activeRules.filter((rule) => input.incomingText.toLowerCase().includes(rule.pattern.toLowerCase())).map((rule) => `rule:${rule.pattern}`);
    const safetyFlags = [...new Set([...keywordFlags, ...configuredFlags])];
    const forcedRule = activeRules.find((rule) => input.incomingText.toLowerCase().includes(rule.pattern.toLowerCase()) && rule.action !== "draft_only");
    const generated = forcedRule
      ? fallbackDraft(input.incomingText, forcedRule.action === "handoff", `নির্ধারিত safety rule: ${forcedRule.pattern}`, [`rule:${forcedRule.pattern}`])
      : await createAiDraft({ incomingText: input.incomingText, channel: input.channel, postContext: input.postContext, conversationContext: input.conversationContext, knowledge: activeKnowledge, style: styles[0] || null, safetyFlags });
    const status = generated.needsHuman ? "handoff" : "pending";
    const result = await db.insert(facebookReplyDrafts).values({
      ownerOpenId: ctx.user.openId,
      channel: input.channel,
      status,
      incomingText: input.incomingText,
      postContext: input.postContext || null,
      conversationContext: input.conversationContext || null,
      suggestedReply: generated.replyText,
      safetyFlags: JSON.stringify(generated.safetyFlags),
      confidence: generated.confidence,
      humanReason: generated.reason || null,
      generatedBy: generated.generatedBy,
    });
    const id = Number(result[0]?.insertId || 0);
    await audit(ctx.user.openId, ctx.user.openId, "draft_created", "draft", id || null, { channel: input.channel, status, generatedBy: generated.generatedBy, safetyFlags: generated.safetyFlags });
    return { success: true, id, status, draft: generated };
  }),

  reviewDraft: adminProcedure.input(z.object({
    draftId: z.number().int().positive(),
    action: z.enum(["approved", "rejected", "handoff"]),
    finalReply: z.string().trim().max(1200).optional(),
    reason: z.string().trim().max(600).optional(),
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const rows = await db.select().from(facebookReplyDrafts)
      .where(and(eq(facebookReplyDrafts.id, input.draftId), eq(facebookReplyDrafts.ownerOpenId, ctx.user.openId))).limit(1);
    if (!rows[0]) throw new Error("Draft পাওয়া যায়নি");
    const update = input.action === "approved"
      ? { status: "approved" as const, finalReply: input.finalReply || rows[0].suggestedReply || null, approvedByOpenId: ctx.user.openId, approvedAt: new Date(), humanReason: input.reason || null }
      : { status: input.action, finalReply: input.finalReply || null, humanReason: input.reason || null };
    await db.update(facebookReplyDrafts).set(update).where(eq(facebookReplyDrafts.id, input.draftId));
    await audit(ctx.user.openId, ctx.user.openId, `draft_${input.action}`, "draft", input.draftId, { hasFinalReply: Boolean(input.finalReply), reason: input.reason || null });
    // This operation intentionally does not send anything to Facebook. Meta send is a separate future phase.
    return { success: true, sent: false };
  }),
});
