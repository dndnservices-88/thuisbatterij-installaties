import { test } from "node:test";
import assert from "node:assert/strict";

import { webhookPayload } from "./opslag";

test("webhook krijgt calc_snapshot ook als tekst, letterlijk gelijk aan het object", () => {
  const snapshot = { antwoorden: { panelen: "ja" }, uitkomst: { besparing: 412 }, zachte_lead: false };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lead = { id: "x", calc_snapshot: snapshot } as any;
  const p = webhookPayload(lead);
  assert.equal(p.calc_snapshot_tekst, JSON.stringify(snapshot));
  assert.deepEqual(JSON.parse(p.calc_snapshot_tekst), snapshot);
  assert.deepEqual(p.calc_snapshot, snapshot);
});

test("zonder snapshot wordt het de tekst null, geen fout", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = webhookPayload({ id: "y" } as any);
  assert.equal(p.calc_snapshot_tekst, "null");
});
