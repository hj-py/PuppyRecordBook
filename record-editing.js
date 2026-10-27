(function (root) {
  "use strict";
  function grams(value) {
    const text = String(value ?? "").trim();
    if (!text) return null;
    const match = text.match(/^(\d+(?:[.,]\d+)?)\s*(?:g|grams?)?$/i);
    if (!match) throw new Error("Enter a non-negative food amount in grams, such as 80 or 80.5g.");
    const amount = Number(match[1].replace(",", "."));
    if (!Number.isFinite(amount) || amount > 1000000) throw new Error("Food amount is too large.");
    return amount;
  }
  const format = value => `${Number(value.toFixed(2))}g`;
  function foodEdit(original, replacement, componentAmounts = []) {
    if (replacement.type !== "food") return replacement;
    const snack = replacement.foodKind === "snack";
    if (snack) return { ...replacement, foodComponents: [] };
    const previous = original?.type === "food" && original.foodKind !== "snack" ? original.foodComponents || [] : [];
    const components = previous.map(component => ({ ...component }));
    let amount = replacement.amount.trim();
    if (components.length > 1) {
      if (componentAmounts.length !== components.length) throw new Error("Check both food amounts before saving.");
      let total = 0, hasAmount = false;
      components.forEach((component, index) => {
        const value = grams(componentAmounts[index]);
        component.amount = value === null ? "" : format(value);
        if (value !== null) { total += value; hasAmount = true; }
      });
      amount = hasAmount ? format(total) : "";
    } else if (amount !== (original?.amount || "")) {
      const value = grams(amount);
      amount = value === null ? "" : format(value);
      if (components.length) components[0].amount = amount;
    }
    let note = replacement.note || "";
    const mixture = list => list.map(component => `${component.amount} ${component.name}`.trim()).join(" + ");
    const oldPrefix = mixture(previous), newPrefix = mixture(components);
    if (oldPrefix && (note === oldPrefix || note.startsWith(oldPrefix + " - "))) note = newPrefix + note.slice(oldPrefix.length);
    return { ...replacement, amount, note, foodComponents: components };
  }
  function saveKey(event) {
    return event.key === "Enter" && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey && !event.isComposing && !event.repeat;
  }
  const api = { grams, format, foodEdit, saveKey };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.PuppyEditing = api;
})(globalThis);
