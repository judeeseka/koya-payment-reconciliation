// Payment reconciliation.
//
// Reads payments.jsonl and works out how much money we actually collected.
// Run:  node reconcile.js

const fs = require("fs");

let total = 0;
let count = 0;

const lines = fs
  .readFileSync("payments.jsonl", "utf8")
  .split("\n")
  .filter((l) => l.length > 0);

const paymentToReconcile = cleanPayments(lines);

for (const payment of paymentToReconcile) {
  if (payment.status === "success") {
    if (typeof payment.amount === "string") {
      total += parseFloat(payment.amount.replace(/,/g, ""));
    } else {
      total += Number(payment.amount);
    }

    count += 1;
  }
}

const expected = parseInt(fs.readFileSync("expected.txt", "utf8").trim(), 10);

if (count !== expected) {
  console.log(
    `Check failed: counted ${count} successful payments, expected ${expected}.`,
  );
  console.log(
    "Something in the data isn't being handled the way the README describes.",
  );
} else {
  console.log(`Check passed: ${count} successful payments.`);
  console.log(`Your code: KOYA-${Math.round(total)}`);
}

function cleanPayments(payments) {
  const cleaned = new Map();

  for (let payment of payments) {
    let event;

    try {
      event = JSON.parse(payment);
    } catch {
      continue;
    }

    if (!event.txn_id) continue;

    const singlePayment = cleaned.get(event.txn_id);
    if (!singlePayment || Date.parse(event.ts) > Date.parse(singlePayment.ts)) {
      cleaned.set(event.txn_id, event);
    }
  }

  return cleaned.values();
}
