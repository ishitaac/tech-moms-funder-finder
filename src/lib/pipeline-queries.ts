/** Read-side queries for the pipeline board and dashboard. */
import { asc, eq } from "drizzle-orm";
import { connection } from "next/server";
import { db, schema } from "@/db";

import type { PaymentRow, PipelineCard } from "./pipeline-model";

export * from "./pipeline-model";

export async function pipelineCards(): Promise<(PipelineCard & { awardedOn: string | null })[]> {
  await connection();
  const rows = await db
    .select({ p: schema.pipelineItems, f: schema.funders, o: schema.opportunities })
    .from(schema.pipelineItems)
    .innerJoin(schema.funders, eq(schema.pipelineItems.funderId, schema.funders.id))
    .leftJoin(schema.opportunities, eq(schema.pipelineItems.opportunityId, schema.opportunities.id))
    .orderBy(asc(schema.pipelineItems.createdAt));
  const pays = await db.select().from(schema.payments);
  const receivedBy = new Map<number, number>();
  for (const p of pays) receivedBy.set(p.pipelineItemId, (receivedBy.get(p.pipelineItemId) ?? 0) + p.amount);

  return rows.map(({ p, f, o }) => ({
    id: p.id,
    funderId: f.id,
    funderName: f.name,
    funderType: f.type,
    opportunityTitle: o?.title ?? null,
    stage: p.stage,
    awardedOn: p.awardedOn,
    amountAsked: p.amountAsked,
    amountAwarded: p.amountAwarded,
    received: receivedBy.get(p.id) ?? 0,
    deadline: p.deadline ?? o?.deadline ?? null,
    isSample: p.isSample,
  }));
}

export async function paymentRows(): Promise<PaymentRow[]> {
  await connection();
  const rows = await db
    .select({ pay: schema.payments, p: schema.pipelineItems, f: schema.funders })
    .from(schema.payments)
    .innerJoin(schema.pipelineItems, eq(schema.payments.pipelineItemId, schema.pipelineItems.id))
    .innerJoin(schema.funders, eq(schema.pipelineItems.funderId, schema.funders.id))
    .orderBy(asc(schema.payments.receivedOn));
  return rows.map(({ pay, p, f }) => ({
    pipelineItemId: p.id,
    funderName: f.name,
    funderType: f.type,
    amount: pay.amount,
    receivedOn: pay.receivedOn,
    isSample: p.isSample,
  }));
}
